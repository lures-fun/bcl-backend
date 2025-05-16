import { ApiProperty } from '@nestjs/swagger';
import { RankingLureColorModel } from '~/ranking/model/ranking-lure-color.model';
import { RankingLure } from '../commons/ranking-lure.dto';
import { RankingSummary } from '../commons/ranking-summary.dto';

export class RankingLureColorDto {
  @ApiProperty({ type: RankingSummary })
  summary: RankingSummary;
  @ApiProperty({ type: RankingLure, isArray: true })
  lure: RankingLure[];

  constructor(param: Partial<RankingLureColorDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(model: RankingLureColorModel) {
    return new RankingLureColorDto({
      summary: RankingSummary.toLureResponse(model),
      lure: RankingLure.toResponse(model),
    });
  }
}
