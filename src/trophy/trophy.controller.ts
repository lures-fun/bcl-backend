import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { TrophyType } from '~/entity/trophy.entity';
import { TrophyDetailDto } from './dto/trophy-detail.dto';
import { TrophyListDto } from './dto/trophy-list.dto';
import { TrophyService } from './trophy.service';

@ApiTags('trophies')
@ApiBearerAuth()
@Controller('trophies')
export class TrophyController {
  constructor(private readonly trophyService: TrophyService) {}

  @ApiOperation({ summary: 'トロフィー一覧取得' })
  @ApiResponse({ status: HttpStatus.OK, type: TrophyListDto })
  @ApiParam({ name: 'trophyType', enum: TrophyType })
  @ApiParam({ name: 'lureType', enum: LureType })
  @UseGuards(AuthGuard('jwt'))
  @Get('/search/:trophyType/:lureType')
  @HttpCode(HttpStatus.OK)
  async search(@Param() params): Promise<TrophyListDto> {
    const res = await this.trophyService.searchTrophies(
      params.lureType,
      params.trophyType,
    );
    return TrophyListDto.toResponse(res);
  }

  @ApiOperation({ summary: 'トロフィー詳細取得' })
  @ApiResponse({ status: HttpStatus.OK, type: TrophyDetailDto })
  @ApiParam({ name: 'id' })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTitle(@Param() params): Promise<TrophyDetailDto> {
    const res = await this.trophyService.getTrophy(params.id);
    return TrophyDetailDto.toResponse(res);
  }
}
