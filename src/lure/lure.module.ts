import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LureImageMasterDao } from '~/dao/lure-image-master.dao';
import { LureReviewStatusLogDao } from '~/dao/lure-review-status-log.dao';
import { LureReviewStatusDao } from '~/dao/lure-review-status.dao';
import { TrophyDao } from '~/dao/trophy.dao';
import { FishingResultReviewStatusLog } from '~/entity/fishing-result-review-status-log.entity';
import { FishingResultReviewStatus } from '~/entity/fishing-result-review-status.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { LureImageMaster } from '~/entity/lure-image-master.entity';
import { LureReviewStatusLog } from '~/entity/lure-review-status-log.entity';
import { LureReviewStatus } from '~/entity/lure-review-status.entity';
import { Lure } from '~/entity/lure.entity';
import { Trophy } from '~/entity/trophy.entity';
import { S3Utils } from '~/util/s3.utils';
import { FishingResultDao } from '../dao/fishing-result.dao';
import { LureDao } from '../dao/lure.dao';
import { LureController } from './lure.controller';
import { LureService } from './lure.service';
import { OneTimeTokenDao } from '~/dao/one-time-token.dao';
import { OneTimeToken } from '~/entity/one-time-token';
import { Member } from '~/entity/member.entity';
import { MemberDao } from '~/dao/member.dao';
import { MintMaster } from '~/entity/mint-master.entity';
import { MintFishingDto } from './dto/mint-fishing.dto';
import { MintMasterDao } from '~/dao/mint-master.dao';
import { ShopifyProducts } from '~/entity/shopify-products.entity';
import { ShopifyProductsDao } from '~/dao/shopify-products.dao';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lure,
      LureReviewStatus,
      LureReviewStatusLog,
      FishingResult,
      FishingResultReviewStatus,
      FishingResultReviewStatusLog,
      LureImageMaster,
      Trophy,
      OneTimeToken,
      Member,
      MintMaster,
      ShopifyProducts,
    ]),
  ],
  controllers: [LureController],
  providers: [
    LureService,
    LureDao,
    LureReviewStatusDao,
    LureReviewStatusLogDao,
    FishingResultDao,
    LureImageMasterDao,
    TrophyDao,
    OneTimeTokenDao,
    MemberDao,
    MintMasterDao,
    ShopifyProductsDao,
    S3Utils,
  ],
  exports: [TypeOrmModule],
})
export class LureModule {}
