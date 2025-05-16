import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldMasterDao } from '~/dao/field-master.dao';
import { FishingResultReviewStatusLogDao } from '~/dao/fishing-result-review-status-log.dao';
import { FishingResultReviewStatusDao } from '~/dao/fishing-result-review-status.dao';
import { LineMasterDao } from '~/dao/line-master.dao';
import { ReelMasterDao } from '~/dao/reel-master.dao';
import { RodMasterDao } from '~/dao/rod-master.dao';
import { FieldMaster } from '~/entity/field-master.entity';
import { FishingResultReviewStatusLog } from '~/entity/fishing-result-review-status-log.entity';
import { FishingResultReviewStatus } from '~/entity/fishing-result-review-status.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { LineMaster } from '~/entity/line-master.entity';
import { ReelMaster } from '~/entity/reel-master.entity';
import { RodMaster } from '~/entity/rod-master.entity';
import { FishingResultDao } from '../dao/fishing-result.dao';
import { FishingResultController } from './fishing-result.controller';
import { FishingResultService } from './fishing-result.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FishingResult,
      FishingResultReviewStatus,
      FishingResultReviewStatusLog,
      FieldMaster,
      LineMaster,
      ReelMaster,
      RodMaster,
    ]),
  ],
  controllers: [FishingResultController],
  providers: [
    FishingResultService,
    FishingResultDao,
    FishingResultReviewStatusDao,
    FishingResultReviewStatusLogDao,
    FieldMasterDao,
    LineMasterDao,
    ReelMasterDao,
    RodMasterDao,
  ],
  exports: [TypeOrmModule],
})
export class FishingResultModule {}
