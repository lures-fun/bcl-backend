import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Member } from '~/entity/member.entity';
import { ReportRequestDto } from './dto/report-request.dto';
import { ReportService } from './report.service';

@ApiTags('report')
@ApiBearerAuth()
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiOperation({ summary: '通報' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Post('/')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async report(
    @Req() req: { user: Member },
    @Body() reportRequestDto: ReportRequestDto,
  ): Promise<void> {
    return await this.reportService.report(
      req.user.id,
      reportRequestDto.reportedMemberId,
      reportRequestDto.reportType,
    );
  }
}
