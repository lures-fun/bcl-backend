import { Injectable, NotFoundException } from '@nestjs/common';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { GoodDao } from '~/dao/good.dao';
import { PostDao } from '~/dao/post.dao';
import { GoodType } from '~/entity/good.entity';
import { GoodMemberListModel } from './model/good-member-list.model';
import { NotificationService } from '~/notification/notification.service';
import { Type } from '~/entity/notification.entity';
import { MemberDao } from '~/dao/member.dao';

@Injectable()
export class GoodService {
  constructor(
    private readonly goodDao: GoodDao,
    private readonly fishingResultDao: FishingResultDao,
    private readonly postDao: PostDao,
    private readonly memberDao: MemberDao,
    private readonly notificationService: NotificationService,
  ) {}

  async countGood(parentId: string): Promise<number> {
    return await this.goodDao.countGood(parentId);
  }

  async isGood(parentId: string, memberId: string): Promise<boolean> {
    return (
      (await this.goodDao.countGoodByParentIdAndMemberId(
        parentId,
        memberId,
      )) !== 0
    );
  }

  async getGoodMembers(
    memberId: string,
    parentId: string,
  ): Promise<GoodMemberListModel[]> {
    return GoodMemberListModel.toModel(
      await this.goodDao.getGoodMembers(memberId, parentId),
    );
  }

  async register(memberId: string, parentId: string): Promise<void> {
    const type = await this.getGoodType(parentId);
    const fromMember = await this.memberDao.findAvailableOneById(memberId);
    const toMemberId = await this.getGoodPostMemberId(type, parentId);
    const model = await this.goodDao.register(memberId, parentId, type);
    if (model && memberId !== toMemberId) {
      this.notificationService.createNotification(
        Type.RECEIVE_LIKE,
        fromMember,
        toMemberId,
        model.id,
      );
    }
  }

  async delete(memberId: string, parentId: string): Promise<void> {
    await this.getGoodType(parentId);
    const existedGood = await this.goodDao.findOne(memberId, parentId);
    this.notificationService.deleteNotificationByParentIdAndType(
      existedGood.id,
      Type.RECEIVE_LIKE,
    );
    this.goodDao.delete(memberId, parentId);
  }

  private async getGoodType(parentId: string): Promise<GoodType> {
    const fishingResult = await this.fishingResultDao.findById(parentId);
    if (!fishingResult) {
      const post = await this.postDao.findById(parentId);
      if (!post) {
        throw new NotFoundException(`Not found good parent: ${parentId}`);
      }
      return GoodType.POST;
    }
    return GoodType.FISHING_RESULT;
  }

  private async getGoodPostMemberId(
    type: GoodType,
    parentId: string,
  ): Promise<string> {
    if (type == GoodType.FISHING_RESULT) {
      const fr = await this.fishingResultDao.findById(parentId);
      return fr.memberId;
    }
    const post = await this.postDao.findById(parentId);
    return post.memberId;
  }
}
