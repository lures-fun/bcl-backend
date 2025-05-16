import { ApiProperty } from '@nestjs/swagger';
import { LureType } from '~/entity/lure.entity';
import { RankingModel } from '~/ranking/model/ranking.model';
import { RankingBigFish } from '../commons/ranking-big-fish.dto';
import { RankingFishingCount } from '../commons/ranking-fishing-count.dto';
import { RankingSummary } from '../commons/ranking-summary.dto';

export class RankingLureTypeDto {
  @ApiProperty({ enum: LureType })
  lureType: LureType;
  @ApiProperty({ type: RankingSummary })
  summary: RankingSummary;
  @ApiProperty({ type: RankingBigFish, isArray: true })
  bigFish: RankingBigFish[];
  @ApiProperty({ type: RankingFishingCount, isArray: true })
  fishingCount: RankingFishingCount[];

  constructor(param: Partial<RankingLureTypeDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(model: RankingModel) {
    return new RankingLureTypeDto({
      lureType: model.lureType,
      summary: RankingSummary.toResponse(model),
      bigFish: RankingBigFish.toResponse(model),
      fishingCount: RankingFishingCount.toResponse(model),
    });
  }
}
