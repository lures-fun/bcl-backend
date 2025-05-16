import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ReportType } from '~/entity/report.entity';

export class ReportRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'reportedMemberIdは必須です' })
  reportedMemberId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'reportTypeは必須です' })
  reportType: ReportType;

  constructor(param: Partial<ReportRequestDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(
    reportedMemberId: string,
    reportType: ReportType,
  ): ReportRequestDto {
    return new ReportRequestDto({ reportedMemberId, reportType });
  }
}
