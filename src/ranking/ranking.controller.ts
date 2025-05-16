import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LureType } from '~/entity/lure.entity';
import { RankingFieldsRequestDto } from './dto/request/ranking-fields.request.dto';
import { RankingFieldDto } from './dto/response/ranking-field.response.dto';
import { RankingFieldsDto } from './dto/response/ranking-fields-response.dto';
import { RankingLureColorDto } from './dto/response/ranking-lure-color.response.dto';
import { RankingLureTypeDto } from './dto/response/ranking-lure-type.response.dto';
import { RankingService } from './ranking.service';
import { RankingTypesRequestDto } from './dto/response/ranking-type-request.response.dto';

@ApiTags('ranking')
@ApiBearerAuth()
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @ApiOperation({
    summary: 'コラボレーションルアータイプランキング(複数指定)',
    description:
      'The top 100 data is always returned. You can filter the top 3 data.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: RankingLureTypeDto })
  @UseGuards(AuthGuard('jwt'))
  @Post('/collaboration/lure-types')
  @HttpCode(200)
  async getLureTypes(
    @Body() requestBody: RankingTypesRequestDto,
  ): Promise<RankingLureTypeDto> {
    const res = await this.rankingService.getLureTypes(requestBody.lureTypes);
    return RankingLureTypeDto.toResponse(res);
  }

  @ApiOperation({
    summary: 'コラボレーションルアーカラー別集計数(複数指定)',
    description: 'Fishing result count grouped by lure color code.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: RankingLureColorDto })
  @UseGuards(AuthGuard('jwt'))
  @Post('/collaboration/lure-color')
  @HttpCode(200)
  async getLureColors(
    @Body() requestBody: RankingTypesRequestDto,
  ): Promise<RankingLureColorDto> {
    const res = await this.rankingService.getLureColors(requestBody.lureTypes);
    return RankingLureColorDto.toResponse(res);
  }

  @ApiOperation({
    summary: 'ルアータイプランキング(単一指定)',
    description:
      'The top 100 data is always returned. You can filter the top 3 data.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: RankingLureTypeDto })
  @ApiParam({ name: 'lureType', enum: LureType })
  @UseGuards(AuthGuard('jwt'))
  @Get('/lure-types/:lureType')
  async getLureType(
    @Param('lureType') lureType: LureType,
  ): Promise<RankingLureTypeDto> {
    const res = await this.rankingService.getLureTypes([lureType]);
    return RankingLureTypeDto.toResponse(res);
  }

  @ApiOperation({
    summary: 'フィールドランキング(複数指定)',
    description:
      'The top 100 data is always returned. You can filter the top 3 data.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: RankingFieldsDto })
  @UseGuards(AuthGuard('jwt'))
  @Post('/fields')
  @HttpCode(200)
  async getFields(
    @Body() requestBody: RankingFieldsRequestDto,
  ): Promise<RankingFieldsDto> {
    const models = await this.rankingService.getFields(requestBody.fields);
    return RankingFieldsDto.toResponse(models);
  }

  @ApiOperation({
    summary: 'フィールドランキング(単一指定)',
    description:
      'The top 100 data is always returned. You can filter the top 3 data.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: RankingFieldDto })
  @UseGuards(AuthGuard('jwt'))
  @Get('/fields/:field')
  async getField(@Param('field') field: string): Promise<RankingFieldDto> {
    const res = await this.rankingService.getField(field);
    return RankingFieldDto.toResponse(res);
  }

  // TODO: カラーごとのルアーの画像は新しく頂いて S3 に配置する
  @ApiOperation({
    summary: 'ルアーカラー別集計数',
    description: 'Fishing result count grouped by lure color code.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: RankingLureColorDto })
  @ApiParam({ name: 'lureType', enum: LureType })
  @UseGuards(AuthGuard('jwt'))
  @Get('/lure-color/:lureType')
  async getLureColor(
    @Param('lureType') lureType: LureType,
  ): Promise<RankingLureColorDto> {
    const res = await this.rankingService.getLureColors([lureType]);
    return RankingLureColorDto.toResponse(res);
  }
}
