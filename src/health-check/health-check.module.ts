import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminNewsService } from '~/admin-news/admin-news.service';
import { NewsDao } from '~/dao/news.dao';
import { News } from '~/entity/news.entity';
import { S3Utils } from '~/util/s3.utils';
import { HealthCheckController } from './health-check.controller';

@Module({
  imports: [TypeOrmModule.forFeature([News])],
  providers: [TypeOrmModule, AdminNewsService, NewsDao, S3Utils],
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}
