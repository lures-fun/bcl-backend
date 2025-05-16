import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FieldMaster } from '~/entity/field-master.entity';
import { LineMaster } from '~/entity/line-master.entity';
import { ReelMaster } from '~/entity/reel-master.entity';
import { RodMaster } from '~/entity/rod-master.entity';
import { TrophyTypeMaster } from '~/entity/trophy-type-master.entity';
import { MasterService } from './master.service';

@ApiTags('master')
@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @ApiOperation({ summary: 'フィールドマスター情報取得' })
  @ApiResponse({ status: HttpStatus.OK, type: FieldMaster, isArray: true })
  @Get('fields')
  async fields(): Promise<FieldMaster[]> {
    return this.masterService.getActiveFields();
  }

  @ApiOperation({ summary: 'リールマスター取得' })
  @ApiResponse({ status: HttpStatus.OK, type: ReelMaster, isArray: true })
  @Get('reels')
  async reels(): Promise<ReelMaster[]> {
    return this.masterService.getActiveReels();
  }

  @ApiOperation({ summary: 'ロッド(釣竿)マスター情報取得' })
  @ApiResponse({ status: HttpStatus.OK, type: RodMaster, isArray: true })
  @Get('rods')
  async rods(): Promise<RodMaster[]> {
    return this.masterService.getActiveRods();
  }

  @ApiOperation({ summary: 'ライン(糸)マスター取得' })
  @ApiResponse({ status: HttpStatus.OK, type: LineMaster, isArray: true })
  @Get('lines')
  async lines(): Promise<LineMaster[]> {
    return this.masterService.getActiveLines();
  }

  @Get('trophy-types')
  async trophyTypes(): Promise<TrophyTypeMaster[]> {
    return this.masterService.getActiveTrophyTypes();
  }
}
