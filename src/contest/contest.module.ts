import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ContestController } from './contest.controller';
import { ContestService } from './contest.service';
import { Contest } from '~/entity/contest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contest])],
  providers: [ContestService],
  controllers: [ContestController],
  exports: [TypeOrmModule],
})
export class ContestModule {}
