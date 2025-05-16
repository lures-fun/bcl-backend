import { ApiProperty } from '@nestjs/swagger';
import { RankingModel } from '~/ranking/model/ranking.model';
import { RankingBigFish } from '../commons/ranking-big-fish.dto';
import { RankingFishingCount } from '../commons/ranking-fishing-count.dto';
import { RankingSummary } from '../commons/ranking-summary.dto';

export class RankingFieldDto {
  @ApiProperty({ example: '0007' })
  field: string;
  @ApiProperty({ type: RankingSummary })
  summary: RankingSummary;
  @ApiProperty({ type: RankingBigFish, isArray: true })
  bigFish: RankingBigFish[];
  @ApiProperty({ type: RankingFishingCount, isArray: true })
  fishingCount: RankingFishingCount[];

  constructor(param: Partial<RankingFieldDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(model: RankingModel) {
    return new RankingFieldDto({
      field: model.field,
      summary: RankingSummary.toResponse(model),
      bigFish: RankingBigFish.toResponse(model),
      fishingCount: RankingFishingCount.toResponse(model),
    });
  }
}
