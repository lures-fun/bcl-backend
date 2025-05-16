import { CustomFishingCountOfLure } from '~/entity/custom/custom-ranking.fishing-count-of-lure';
import { LureType } from '~/entity/lure.entity';
import {
  LureBaseColorFileNameDto,
  findUrl,
} from '~/util/lure-base-color-file-name.utils';

export class RankingLureColorModel {
  summary: Summary;
  fishingCountRanking: FishingCountOfLure[];

  constructor(param: Partial<RankingLureColorModel> = {}) {
    Object.assign(this, param);
  }

  static toModel(
    fishingTotalCount: number,
    fishingCountRanking: CustomFishingCountOfLure[],
    lureBaseColorFileNames: LureBaseColorFileNameDto[],
  ): RankingLureColorModel {
    return new RankingLureColorModel({
      summary: new Summary({ fishingTotalCount: fishingTotalCount }),
      fishingCountRanking: fishingCountRanking.map((e) =>
        FishingCountOfLure.toModel(e, lureBaseColorFileNames),
      ),
    });
  }
}

export class Summary {
  fishingTotalCount: number;

  constructor(param: Partial<Summary> = {}) {
    Object.assign(this, param);
  }
}

export class FishingCountOfLure {
  color: string;
  lureType: LureType;
  fishingCount: number;
  imagePathForNft: string;

  constructor(param: Partial<FishingCountOfLure> = {}) {
    Object.assign(this, param);
  }

  static toModel(
    entity: CustomFishingCountOfLure,
    lureBaseColorFileNames: LureBaseColorFileNameDto[],
  ): FishingCountOfLure {
    return new FishingCountOfLure({
      color: entity.color,
      lureType: entity.lureType,
      fishingCount: entity.fishingCount,
      imagePathForNft: findUrl(
        lureBaseColorFileNames,
        entity.lureType,
        entity.color,
      ),
    });
  }
}
