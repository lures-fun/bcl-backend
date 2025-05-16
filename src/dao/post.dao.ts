import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { DeleteResult, EntityManager, IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CustomPostWithUserNameEntity } from '~/entity/custom/post-with-user-name.entity';
import { Post } from '~/entity/post.entity';
import { DateUtils } from '~/util/date.utils';

@Injectable()
export class PostDao {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  public async logicalDelete(
    id: string,
    memberId: string,
  ): Promise<DeleteResult> {
    return await this.postRepository.update(
      { id, memberId }, // 自分の投稿のみ削除可能
      { deletedAt: DateUtils.now() },
    );
  }

  public async updateImagePathAndExtensionById(
    id: string,
    imagePaths: string[],
    extensions: string[],
  ): Promise<void> {
    const updateParams = Post.generateImagePathAndExtention(
      imagePaths,
      extensions,
    );
    await this.postRepository.update({ id }, {
      ...updateParams,
    } as QueryDeepPartialEntity<Post>);
  }

  public async insert(entity: Post): Promise<string> {
    const insertResult = await this.postRepository.insert(entity);
    return insertResult.generatedMaps[0].id;
  }

  public async save(entity: Post): Promise<Post> {
    return await this.postRepository.save(entity);
  }

  public async findById(id: string): Promise<Post> {
    return await this.postRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }

  public async selectByUserName(userName: string): Promise<Post[]> {
    const sql = readFileSync(
      'src/dao/mapper/post-query-post-by-user-name.sql',
      'utf-8',
    );
    const raws = await this.entityManager.query(sql, [userName]);
    return Post.toCustomEntities(raws);
  }

  public async selectByComment(
    text: string,
  ): Promise<CustomPostWithUserNameEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/post.search-like.mapper.sql',
      'utf-8',
    );
    const raws = await this.entityManager.query(sql, [`%${text}%`]);
    return CustomPostWithUserNameEntity.toCustomEntities(raws);
  }
}
