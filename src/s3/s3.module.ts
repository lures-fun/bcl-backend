import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Utils } from '~/util/s3.utils';
import { S3Controller } from './s3.controller';

@Module({
  imports: [],
  controllers: [S3Controller],
  providers: [S3Utils, ConfigService],
  exports: [],
})
export class S3Module {}
