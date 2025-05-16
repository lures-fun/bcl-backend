import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CommentRegisterModel } from '~/comment/model/comment-model';
import { CommentDao } from '~/dao/comment.dao';
import { FishingResultReviewStatusDao } from '~/dao/fishing-result-review-status.dao';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { MemberDao } from '~/dao/member.dao';
import { PostDao } from '~/dao/post.dao';
import { TokenTransactionDao } from '~/dao/token-transaction.dao';
import { Comment, CommentType } from '~/entity/comment.entity';
import { CustomCommentThreadsEntity } from '~/entity/custom/custom-comment-threds.entity';
import { CustomCommentWithProfileIconEntity } from '~/entity/custom/custom-comment-with-profile-icon.entity';
import { ReviewStatus } from '~/entity/fishing-result-review-status.entity';
import { Member } from '~/entity/member.entity';
import { Type } from '~/entity/notification.entity';
import {
  giveTokenType,
  Status,
  TokenTransaction,
} from '~/entity/token-transaction.entity';
import { NotificationService } from '~/notification/notification.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly memberDao: MemberDao,
    private readonly commentDao: CommentDao,
    private readonly fishingResultDao: FishingResultDao,
    private readonly fishingResultReviewStatusDao: FishingResultReviewStatusDao,
    private readonly postDao: PostDao,
    private readonly tokenTransactionDao: TokenTransactionDao,
    private readonly notificationService: NotificationService,
  ) {}

  async getCommentsByParentId(
    parentId: string,
  ): Promise<CustomCommentWithProfileIconEntity[]> {
    return await this.commentDao.selectByParentId(parentId);
  }

  async getThreadsByParentId(
    parentId: string,
    parentCommentId?: string,
  ): Promise<CustomCommentThreadsEntity[]> {
    return await this.commentDao.selectThreads(parentId, parentCommentId);
  }

  async getCommentById(
    id: string,
  ): Promise<CustomCommentWithProfileIconEntity> {
    const comment = await this.commentDao.findById(id);
    if (!comment) {
      throw new NotFoundException(`Not found comment:${id}.`);
    }

    return comment;
  }

  async register(model: CommentRegisterModel): Promise<void> {
    const parentTypeAndMemberId =
      await this.checkParentIdReturnParentTypeAndMemberId(model.parentId);

    // token数の妥当性を検証

    await this.entityManager.transaction(async (manager) => {
      // 同時実行させないためmemberテーブルのロックを取得
      this.memberDao.selectForUpdate(model.memberId, manager);

      // ロック取得後にトークンチェック
      await this.checkTokenSendable(
        model.memberId,
        parentTypeAndMemberId.type,
        model.tokenQuantity,
      );

      // コメントに対する返信時は親のコメントが存在することが前提
      // コメントに対する返信は１階層までなので、スレッドの親のコメントIDが指定されていることもチェックする
      if (model.parentCommentId) {
        const parentComment = await this.commentDao.findById(
          model.parentCommentId,
        );
        if (!parentComment) {
          throw new NotFoundException(
            `Not found comment:${model.parentCommentId}.`,
          );
        }
        if (parentComment.parentCommentId) {
          throw new BadRequestException(
            'Please specify the parent threads comment ID.',
          );
        }
      }

      const commentId = await this.commentDao.insertWithTransaction(
        new Comment({
          parentId: model.parentId,
          parentCommentId: model.parentCommentId,
          memberId: model.memberId,
          type: parentTypeAndMemberId.type,
          comment: model.comment,
          tokenQuantity: model.tokenQuantity,
        }),
        manager,
      );

      if (model.tokenQuantity) {
        this.tokenTransactionDao.insertWithTransaction(
          new TokenTransaction({
            parentId: commentId,
            from: model.memberId,
            to: parentTypeAndMemberId.memberId,
            quantity: model.tokenQuantity,
            status: Status.FIX, // TODO: BCでのtoken移転が発生するようになったらREADYにする。状態遷移は READY -> (token移転完了) -> FIX
            giveTokenType: giveTokenType.COMMENT,
          }),
          manager,
        );
      }
      // save notification when comment on your post
      const fromMember = await this.memberDao.findAvailableOneById(
        model.memberId,
      );
      const toMembers = await this.extractMentionedMembers(model.comment);
      toMembers.forEach((toMember) => {
        if (
          !toMember ||
          toMember.id === fromMember.id ||
          toMember.id === parentTypeAndMemberId.memberId
        )
          return;
        this.notificationService.createNotification(
          Type.RECEIVE_COMMENT,
          fromMember,
          toMember.id,
          commentId, //commentId can be parent comment id or reply comment id < line 102 >
        );
      });

      //  create notification for post owner
      //  condition for preventing from sending post owner's comment notification to himself
      if (parentTypeAndMemberId.memberId !== model.memberId) {
        this.notificationService.createNotification(
          Type.RECEIVE_COMMENT,
          fromMember,
          parentTypeAndMemberId.memberId,
          commentId, //commentId can be parent comment id or reply comment id < line 102 >
        );
      }
      // TODO: token移転処理
    });
  }

  /**
   * コメントのみを削除する。
   * トークンのやり取りは削除しない。（トークンをもとに戻すことはしない）
   * 誹謗中傷コメントを非表示にしたい場合にこの関数を利用する
   */
  async delete(id: string, memberId: string): Promise<void> {
    this.commentDao.logicalDelete(id, memberId);
  }

  /**
   * 親IDが存在するかチェックします。
   * 存在しない場合はClientExceptionをthrowします。
   * 存在する場合は親IDに紐づくCommentTypeとmemberIdを返却します。
   *
   * @param parentId 親ID
   * @returns 親IDに紐づくCommentTypeとmemberId
   */
  private async checkParentIdReturnParentTypeAndMemberId(
    parentId: string,
  ): Promise<{ type: CommentType; memberId: string }> {
    const fishingResult = await this.fishingResultDao.findById(parentId);
    if (fishingResult) {
      const fishingResultReviewStatus =
        await this.fishingResultReviewStatusDao.findLatestByFishingResultId(
          fishingResult.id,
        );
      if (fishingResultReviewStatus.status !== ReviewStatus.APPROVE) {
        throw new ConflictException(
          `Fishing result is not approval: ${parentId}`,
        );
      }
      return {
        type: CommentType.FISHING_RESULT,
        memberId: fishingResult.memberId,
      };
    }
    const post = await this.postDao.findById(parentId);
    if (!post) {
      throw new NotFoundException(`Not found parent: ${parentId}`);
    }
    return {
      type: CommentType.POST,
      memberId: post.memberId,
    };
  }

  /**
   * トークン数の妥当性を検証（詳細は以下）
   * 1. 自信のリソースへのコメントであれば 0 であること
   * 2. 釣果へのコメントであれば 1 であること
   */
  private async validateTokenCount(
    fromMemberId: string,
    toMemberId: string,
    type: CommentType,
    tokenQuantity?: number,
  ) {
    // 自信へのコメントか確認
    if (fromMemberId === toMemberId) {
      if (tokenQuantity && tokenQuantity !== 0) {
        throw new BadRequestException('Cannot send tokens to self.');
      }
    }
    if (type === CommentType.FISHING_RESULT) {
      if (tokenQuantity !== 1) {
        // Service層でBadRequestExceptionは気持ち悪いがいったんしゃあなし
        throw new BadRequestException(
          'Be sure to specify 1 token when commenting on fishing results.',
        );
      }
    }
  }

  /**
   * 送付しようとしているトークン数を保持しているかチェック
   */
  private async checkTokenSendable(
    memberId: string,
    type: CommentType,
    tokenQuantity?: number,
  ) {
    if (!tokenQuantity) {
      return;
    }

    const availableTokenCount =
      await this.tokenTransactionDao.findAvailableTokenCount(memberId);
    if (availableTokenCount < tokenQuantity) {
      throw new ConflictException(
        `Available token count = ${availableTokenCount}, attempted token count = ${tokenQuantity}.memberId:${memberId}`,
      );
    }
  }

  async extractMentionedMembers(text: string): Promise<Member[]> {
    const parts = text.split(/(@\w+)/g);
    const usernames = parts
      .map((part) => {
        const match = part.match(/@(\w+)/);
        if (match) {
          const [, username] = match;
          if (username) return username;
        }
      })
      .filter((u) => u);
    const toMembers = await this.memberDao.findAvailableByUserNames([
      ...new Set(usernames),
    ]);
    return toMembers.filter((m) => m);
  }

  private async transferToken(
    from: string,
    to: string,
    tokenQuantity: number,
  ): Promise<void> {
    // TODO BlockChain token移転処理が実装待ち
  }
}
