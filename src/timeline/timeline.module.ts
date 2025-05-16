import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelineAlreadyReadDao } from '~/dao/timeline-already-read.dao';
import { TimelineDao } from '~/dao/timeline.dao';
import { Timeline } from '~/entity/custom/timeline.entity';
import { TimelineAlreadyRead } from '~/entity/timeline-already-read.entity';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

@Module({
  imports: [TypeOrmModule.forFeature([Timeline, TimelineAlreadyRead])],
  controllers: [TimelineController],
  providers: [TimelineService, TimelineDao, TimelineAlreadyReadDao],
  exports: [TypeOrmModule],
})
export class TimelineModule {}
