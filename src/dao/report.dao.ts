import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Repository } from 'typeorm';
import { Report, ReportType } from '~/entity/report.entity';

@Injectable()
export class ReportDao {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  public async save(report: Report): Promise<Report> {
    return await this.reportRepository.save(report);
  }

  public async delete(id: string): Promise<DeleteResult> {
    return await this.reportRepository.delete({ id });
  }

  public async findOne(
    memberId: string,
    reportedMemberId: string,
    reportType: ReportType,
  ): Promise<Report> {
    return await this.reportRepository.findOne({
      where: {
        memberId: memberId,
        reportedMemberId: reportedMemberId,
        reportType: reportType,
      },
    });
  }
}
