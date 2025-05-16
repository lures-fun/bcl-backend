import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMerchandiseController } from '~/admin-merchandise/admin-merchandise.controller';
import { AdminMerchandiseService } from '~/admin-merchandise/admin-merchandise.service';
import { CompressCollectionDao } from '~/dao/compress-collection.dao';
import { ContestDao } from '~/dao/contest.dao';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { LureDao } from '~/dao/lure.dao';
import { MemberDao } from '~/dao/member.dao';
import { MerchandiseDao } from '~/dao/merchandise.dao';
import { MintMasterDao } from '~/dao/mint-master.dao';
import { TokenMasterDao } from '~/dao/token-master.dao';
import { TokenTransactionDao } from '~/dao/token-transaction.dao';
import { TrophyDao } from '~/dao/trophy.dao';
import { CompressCollection } from '~/entity/compress-collection.entity';
import { Contest } from '~/entity/contest.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { LureReviewStatusLog } from '~/entity/lure-review-status-log.entity';
import { LureReviewStatus } from '~/entity/lure-review-status.entity';
import { Lure } from '~/entity/lure.entity';
import { Member } from '~/entity/member.entity';
import { Merchandise } from '~/entity/merchandise.entity';
import { MintMaster } from '~/entity/mint-master.entity';
import { TokenMaster } from '~/entity/token-master.entity';
import { TokenTransaction } from '~/entity/token-transaction.entity';
import { Trophy } from '~/entity/trophy.entity';
import { CryptUtils } from '~/util/crypt.utils';
import { S3Utils } from '~/util/s3.utils';
import { TokenUtils } from '~/util/token.utils';
import { BatchService } from './batch.service';
import { Notification } from '~/entity/notification.entity';
import { TokenExpo } from '~/entity/tokens-expo.entity';
import { NotificationService } from '~/notification/notification.service';
import { NotificationDao } from '~/dao/notification.dao';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchandise,
      Member,
      MintMaster,
      CompressCollection,
      Trophy,
      Contest,
      FishingResult,
      Lure,
      LureReviewStatus,
      LureReviewStatusLog,
      TokenTransaction,
      TokenMaster,
      Notification,
      TokenExpo,
    ]),
  ],
  controllers: [AdminMerchandiseController],
  providers: [
    BatchService,
    AdminMerchandiseService,
    MerchandiseDao,
    MemberDao,
    MintMasterDao,
    CompressCollectionDao,
    TrophyDao,
    ContestDao,
    FishingResultDao,
    LureDao,
    TokenTransactionDao,
    TokenMasterDao,
    S3Utils,
    CryptUtils,
    TokenUtils,
    NotificationService,
    NotificationDao,
  ],
  exports: [TypeOrmModule],
})
export class BatchModule {}
