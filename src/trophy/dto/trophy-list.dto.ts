import { ApiProperty } from '@nestjs/swagger';
import { LureType } from '~/entity/lure.entity';
import { TrophyListModel } from '../model/trophy-list.model';

export class TrophyListResult {
  @ApiProperty()
  trophyId: string;
  @ApiProperty()
  memberId: string;
  @ApiProperty()
  contestId: string;
  @ApiProperty()
  field: string;
  @ApiProperty()
  color: string;
  @ApiProperty({ enum: LureType })
  lureType: LureType;
  @ApiProperty()
  lureImagePath: string;
  @ApiProperty()
  size: number;
  @ApiProperty()
  userName: string;
  @ApiProperty()
  profileIcon: string;
  @ApiProperty()
  caughtAt: Date;

  constructor(param: Partial<TrophyListResult> = {}) {
    Object.assign(this, param);
  }

  static toResponse(model: TrophyListModel): TrophyListResult {
    return new TrophyListResult(model);
  }
}

export class TrophyListDto {
  @ApiProperty()
  summary: number;
  @ApiProperty({ type: TrophyListResult, isArray: true })
  results: TrophyListResult[];

  constructor(param: Partial<TrophyListDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(models: TrophyListModel[]): TrophyListDto {
    return new TrophyListDto({
      summary: models.length,
      results: models.map((e) => TrophyListResult.toResponse(e)),
    });
  }
}
