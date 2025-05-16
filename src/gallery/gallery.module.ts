import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { FollowDao } from '~/dao/follow.dao';
import { MemberDao } from '~/dao/member.dao';
import { TrophyDao } from '~/dao/trophy.dao';
import { FishingResultReviewStatusLog } from '~/entity/fishing-result-review-status-log.entity';
import { FishingResultReviewStatus } from '~/entity/fishing-result-review-status.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { Follow } from '~/entity/follow.entity';
import { Member } from '~/entity/member.entity';
import { Trophy } from '~/entity/trophy.entity';
import { CryptUtils } from '~/util/crypt.utils';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      Trophy,
      FishingResult,
      FishingResultReviewStatus,
      FishingResultReviewStatusLog,
      Follow,
    ]),
  ],
  providers: [
    GalleryService,
    MemberDao,
    FishingResultDao,
    TrophyDao,
    FollowDao,
    CryptUtils,
  ],
  controllers: [GalleryController],
  exports: [TypeOrmModule],
})
export class GalleryModule {}
