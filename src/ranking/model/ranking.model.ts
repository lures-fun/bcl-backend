import { CustomRankingBigFish } from '~/entity/custom/custom-ranking.big-fish.entity';
import { CustomFishingCountOfMember } from '~/entity/custom/custom-ranking.fishing-count-of-member.entity';
import { LureType } from '~/entity/lure.entity';

export class RankingModel {
  lureType: LureType;
  field: string;
  summary: Summary;
  bigFishRanking: CustomRankingBigFish[];
  fishingCountRanking: CustomFishingCountOfMember[];

  constructor(param: Partial<RankingModel> = {}) {
    Object.assign(this, param);
  }

  static toModel(
    lureType: LureType,
    field: string,
    fishingTotalCount: number,
    bigFishRanking: CustomRankingBigFish[],
    fishingCountRanking: CustomFishingCountOfMember[],
  ): RankingModel {
    return new RankingModel({
      lureType: lureType,
      field: field,
      summary: new Summary({ fishingTotalCount: fishingTotalCount }),
      bigFishRanking: bigFishRanking,
      fishingCountRanking: fishingCountRanking,
    });
  }

  static toModels(
    fields: string[],
    fishingTotalCount: Map<string, number>,
    bigFishRanking: CustomRankingBigFish[],
    fishingCountRanking: CustomFishingCountOfMember[],
  ): RankingModel[] {
    const bigFishHash = bigFishRanking.reduce((fieldHash, entity) => {
      const { field } = entity;
      fieldHash[field] = fieldHash[field] || [];
      fieldHash[field].push(entity);
      return fieldHash;
    }, {} as Record<string, CustomRankingBigFish[]>);
    const fishingHash = fishingCountRanking.reduce((fieldHash, entity) => {
      const { field } = entity;
      fieldHash[field] = fieldHash[field] || [];
      fieldHash[field].push(entity);
      return fieldHash;
    }, {} as Record<string, CustomFishingCountOfMember[]>);
    return fields.map((e) =>
      RankingModel.toModel(
        null,
        e,
        fishingTotalCount.get(e) || 0,
        bigFishHash[e] || [],
        fishingHash[e] || [],
      ),
    );
  }
}

export class Summary {
  fishingTotalCount: number;

  constructor(param: Partial<Summary> = {}) {
    Object.assign(this, param);
  }
}
