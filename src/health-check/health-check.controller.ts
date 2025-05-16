import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminNewsService } from '~/admin-news/admin-news.service';

@ApiTags('health')
@ApiBearerAuth()
@Controller('health')
export class HealthCheckController {
  constructor(private readonly adminNewsService: AdminNewsService) {}

  @ApiOperation({ summary: 'ヘルスチェック' })
  @ApiResponse({ status: HttpStatus.OK })
  @Get('/')
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<void> {
    // DB疎通チェック
    this.adminNewsService.searchNews();
    return;
  }
}
