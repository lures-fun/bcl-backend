import { ApiProperty } from '@nestjs/swagger';
import { RankingLureColorModel } from '~/ranking/model/ranking-lure-color.model';
import { RankingModel } from '~/ranking/model/ranking.model';

export class RankingSummary {
  @ApiProperty({ example: 1 })
  fishingTotalCount: number;

  constructor(param: Partial<RankingSummary> = {}) {
    Object.assign(this, param);
  }

  static toResponse(model: RankingModel): RankingSummary {
    return new RankingSummary({
      fishingTotalCount: model.summary.fishingTotalCount,
    });
  }

  static toLureResponse(model: RankingLureColorModel): RankingSummary {
    return new RankingSummary({
      fishingTotalCount: model.summary.fishingTotalCount,
    });
  }
}
