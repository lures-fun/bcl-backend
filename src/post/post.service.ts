import { Injectable, NotFoundException } from '@nestjs/common';
import { PostDao } from '~/dao/post.dao';
import { Post } from '~/entity/post.entity';
import { TokenType } from '~/entity/token-master.entity';
import { giveTokenType } from '~/entity/token-transaction.entity';
import { TokenUtils } from '~/util/token.utils';
import { PostModifyModel, PostRegisterModel } from './model/post-model';

@Injectable()
export class PostService {
  constructor(
    private readonly postDao: PostDao,
    private readonly tokenUtils: TokenUtils,
  ) {}

  async getPostById(id: string): Promise<Post> {
    return await this.postDao.findById(id);
  }

  async getPostsByUserName(userName: string): Promise<Post[]> {
    return await this.postDao.selectByUserName(userName);
  }

  async delete(id: string, memberId: string): Promise<void> {
    await this.postDao.logicalDelete(id, memberId);
  }

  async register(model: PostRegisterModel): Promise<number> {
    const extensions = model.images.map(
      (image) => image.match(/\.([^.\/]+)$/)?.[1],
    );
    const imagePaths = model.images.slice();

    // 投稿を登録
    const post = await this.postDao.save(
      new Post({
        memberId: model.memberId,
        comment: model.comment,
        ...Post.generateImagePathAndExtention(imagePaths, extensions),
      }),
    );

    // トークン付与（トークン付与失敗した際は、運営が手動でトークンを付与する）
    return await this.tokenUtils.giveTokenFromTokenMaster(
      [model.memberId],
      TokenType.POST,
      giveTokenType.POST,
      post.id,
      null,
    );
  }

  async modify(model: PostModifyModel): Promise<void> {
    this.checkOwnPost(model.id, model.memberId);
    const extensions = model.images.map(
      (image) => image.match(/\.([^.\/]+)$/)?.[1],
    );
    const imagePaths = model.images.slice();
    await this.postDao.save(
      new Post({
        id: model.id,
        comment: model.comment,
        ...Post.generateImagePathAndExtention(imagePaths, extensions),
      }),
    );
  }

  private async checkOwnPost(id: string, memberId: string) {
    const post = await this.postDao.findById(id);
    if (post.memberId !== memberId) {
      throw new NotFoundException(`Not found post: ${id}.`);
    }
  }
}
