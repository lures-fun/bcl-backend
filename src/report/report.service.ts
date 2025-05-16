import { Injectable, NotFoundException } from '@nestjs/common';
import { MemberDao } from '~/dao/member.dao';
import { ReportDao } from '~/dao/report.dao';
import { Report, ReportType } from '~/entity/report.entity';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportDao: ReportDao,
    private readonly memberDao: MemberDao,
  ) {}

  async report(
    memberId: string,
    reportedMemberId: string,
    reportType: ReportType,
  ): Promise<void> {
    const existedReport = await this.getReportMember(
      memberId,
      reportedMemberId,
      reportType,
    );
    if (existedReport != null) {
      return;
    }
    const reportedMember = await this.memberDao.findAvailableOneById(
      reportedMemberId,
    );
    if (reportedMember == null) {
      throw new NotFoundException('Not found reported member');
    }
    const report = new Report();
    report.reportedMemberId = reportedMemberId;
    report.memberId = memberId;
    report.reportType = reportType;
    const now = new Date();
    report.createdAt = now;
    await this.reportDao.save(report);
  }

  async getReportMember(
    memberId: string,
    reportedMemberId: string,
    reportType: ReportType,
  ): Promise<Report> {
    return await this.reportDao.findOne(memberId, reportedMemberId, reportType);
  }
}
