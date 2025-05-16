import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TranslateService } from './translate.service';
import { TranslateDto } from './dto/translate.dto';

@ApiTags('translate')
@ApiBearerAuth()
@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @ApiOperation({ summary: '翻訳' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.OK)
  async translate(@Body() request: TranslateDto): Promise<string[]> {
    return await this.translateService.translate(request);
  }
}
