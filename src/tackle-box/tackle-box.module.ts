import { Module } from '@nestjs/common';
import { TackleBoxController } from './tackle-box.controller';
import { TackleBoxService } from './tackle-box.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LureReviewStatus } from '~/entity/lure-review-status.entity';
import { Lure } from '~/entity/lure.entity';
import { LureDao } from '~/dao/lure.dao';
import { LureReviewStatusLog } from '~/entity/lure-review-status-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lure, LureReviewStatus, LureReviewStatusLog])],
  controllers: [TackleBoxController],
  providers: [TackleBoxService, LureDao],
  exports: [TypeOrmModule],
})
export class TackleBoxModule {}
