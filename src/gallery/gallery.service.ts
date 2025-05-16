import { Injectable, NotFoundException } from '@nestjs/common';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { FollowDao } from '~/dao/follow.dao';
import { MemberDao } from '~/dao/member.dao';
import { TrophyDao } from '~/dao/trophy.dao';
import { Member } from '~/entity/member.entity';
import { CryptUtils } from '~/util/crypt.utils';
import { GalleryDto } from './dto/gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    private readonly trophyDao: TrophyDao,
    private readonly memberDao: MemberDao,
    private readonly followDao: FollowDao,
    private readonly fishingResultDao: FishingResultDao,
    private readonly cryptUtils: CryptUtils,
  ) {}

  async getGallery(userName: string, me: Member): Promise<GalleryDto> {
    const member = await this.memberDao.findAvailableOneByUserName(userName);
    if (!member) {
      throw new NotFoundException('Not found member');
    }
    const walletAddress = await this.cryptUtils.decryptText(
      member.walletAddress,
    );
    const fishingResults =
      await this.fishingResultDao.queryFishingResultsWithMint(member.id);
    const biggestFish = Math.max(...fishingResults.map((e) => e.size));
    const isFollowed =
      (await this.followDao.findOne(me.id, member.id))?.id != null;
    return GalleryDto.toResponse(
      await this.trophyDao.queryMyTrophies(member.id),
      fishingResults,
      member,
      (await this.followDao.findMyFollower(member.id)).length,
      (await this.followDao.getFollowees(member.id)).length,
      biggestFish,
      isFollowed,
      walletAddress,
    );
  }
}
