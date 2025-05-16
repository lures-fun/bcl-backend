import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingBigFishDao } from '~/dao/ranking-big-fish.dao';
import { RankingFishingCountDao } from '~/dao/ranking-fishing-count.dao';
import { RankingSummaryDao } from '~/dao/ranking-summary.dao';
import { FishingResultReviewStatus } from '~/entity/fishing-result-review-status.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { LureReviewStatus } from '~/entity/lure-review-status.entity';
import { Lure } from '~/entity/lure.entity';
import { LureBaseColorFileNameUtil } from '~/util/lure-base-color-file-name.utils';
import { S3Utils } from '~/util/s3.utils';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lure,
      LureReviewStatus,
      FishingResult,
      FishingResultReviewStatus,
    ]),
  ],
  controllers: [RankingController],
  providers: [
    RankingService,
    LureBaseColorFileNameUtil,
    S3Utils,
    RankingSummaryDao,
    RankingFishingCountDao,
    RankingBigFishDao,
  ],
  exports: [TypeOrmModule],
})
export class RankingModule {}
