import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { renderString } from 'nunjucks';
import { DeleteResult, EntityManager, IsNull, Repository } from 'typeorm';
import { Comment } from '~/entity/comment.entity';
import { CustomCommentThreadsEntity } from '~/entity/custom/custom-comment-threds.entity';
import { CustomCommentWithProfileIconEntity } from '~/entity/custom/custom-comment-with-profile-icon.entity';
import { DateUtils } from '~/util/date.utils';

@Injectable()
export class CommentDao {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  public async logicalDelete(
    id: string,
    memberId: string,
  ): Promise<DeleteResult> {
    return await this.commentRepository.update(
      { id, memberId }, // 自分のコメントのみ削除可能
      { deletedAt: DateUtils.now() },
    );
  }

  public async insertWithTransaction(
    entity: Comment,
    manager: EntityManager,
  ): Promise<string> {
    const insertResult = await manager.getRepository(Comment).insert(entity);
    return insertResult.generatedMaps[0].id;
  }

  public async findLatestByParentId(parentId: string): Promise<Comment> {
    return await this.commentRepository.find({
      where: { parentId },
      order: {
        createdAt: 'DESC',
      },
    })[0];
  }

  public async selectByParentId(
    parentId: string,
  ): Promise<CustomCommentWithProfileIconEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/custom-comments-with-profile-icon-by-parent-id.sql',
      'utf-8',
    );

    const res = await this.entityManager.query(sql, [parentId]);
    if (!res) {
      return [];
    }
    return CustomCommentWithProfileIconEntity.toEntities(res);
  }

  public async selectThreads(
    parentId: string,
    parentCommentId?: string,
  ): Promise<CustomCommentThreadsEntity[]> {
    const template = readFileSync(
      'src/dao/mapper/custom-comments-threads.sql',
      'utf-8',
    );
    const sql = renderString(template, {
      parentCommentId: parentCommentId,
    });
    const res = await this.entityManager.query(sql, [
      parentId,
      parentCommentId,
    ]);
    if (!res) {
      return [];
    }
    return CustomCommentThreadsEntity.toEntities(res);
  }

  public async findById(
    id: string,
  ): Promise<CustomCommentWithProfileIconEntity | null> {
    const sql = readFileSync(
      'src/dao/mapper/custom-comment-with-profile-icon-by-id.sql',
      'utf-8',
    );

    const res = await this.entityManager.query(sql, [id]);
    if (!res || res.length === 0) {
      return null;
    }
    return CustomCommentWithProfileIconEntity.toEntity(res[0]);
  }

  public async findByIdAndMemberId(
    id: string,
    memberId: string,
  ): Promise<Comment> {
    return await this.commentRepository.findOne({
      where: { id, memberId, deletedAt: IsNull() },
    });
  }
}
