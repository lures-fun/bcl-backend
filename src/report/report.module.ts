import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberDao } from '~/dao/member.dao';
import { ReportDao } from '~/dao/report.dao';
import { Member } from '~/entity/member.entity';
import { Report } from '~/entity/report.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Member])],
  providers: [ReportService, ReportDao, MemberDao],
  controllers: [ReportController],
  exports: [TypeOrmModule],
})
export class ReportModule {}
