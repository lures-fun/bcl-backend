import { Injectable } from '@nestjs/common';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { PostDao } from '~/dao/post.dao';
import { CustomUserDetailEntity } from '~/entity/custom/user.query-user-detail.entity';
import { MemberDao } from '../dao/member.dao';

@Injectable()
export class SearchService {
  constructor(
    private readonly memberDao: MemberDao,
    private readonly fishingResultDao: FishingResultDao,
    private readonly postDao: PostDao,
  ) {}

  async searchUsers(searchText: string): Promise<CustomUserDetailEntity[]> {
    return await this.memberDao.searchMemberByFirstNameOrLastNameOrUserName(
      searchText,
    );
  }

  async searchFishingResults(
    searchText: string,
  ): Promise<{ id: string; imagePath: string; userName: string }[]> {
    const customFishingResults = await this.fishingResultDao.selectByComment(
      searchText,
    );
    return customFishingResults.map((fr) => ({
      id: fr.id,
      imagePath: fr.imagePathForNft,
      userName: fr.userName,
    }));
  }

  async searchDAOTalks(
    searchText: string,
  ): Promise<{ id: string; imagePath: string; userName: string }[]> {
    const posts = await this.postDao.selectByComment(searchText);
    return posts.map((post) => ({
      id: post.id,
      imagePath: post.imagePath1,
      userName: post.userName,
    }));
  }
}
