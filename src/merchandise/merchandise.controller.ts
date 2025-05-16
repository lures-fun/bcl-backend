import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { MerchandiseDetailDto } from './dto/merchandise-detail.dto';
import { MerchandiseService } from './merchandise.service';

@Controller('merchandises')
export class MerchandiseController {
  constructor(private readonly merchandiseService: MerchandiseService) {}

  @ApiOperation({ summary: '公式グッズ取得' })
  @ApiParam({ name: 'userName' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MerchandiseDetailDto,
    isArray: true,
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('/list/:userName')
  @HttpCode(HttpStatus.OK)
  async getMyMerchandise(@Param() params): Promise<MerchandiseDetailDto[]> {
    const res = await this.merchandiseService.getMyMerchandise(params.userName);
    return MerchandiseDetailDto.toResponses(res);
  }

  @ApiOperation({ summary: '公式グッズ詳細取得' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MerchandiseDetailDto,
    isArray: false,
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string): Promise<MerchandiseDetailDto> {
    const res = await this.merchandiseService.getMerchandise(id);
    return MerchandiseDetailDto.toResponse(res);
  }
}
