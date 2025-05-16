import { CustomLureDetailWithStatusEntity } from '~/entity/custom/lure.query-lure-with-status.entity';
import { ReviewStatus } from '~/entity/lure-review-status.entity';
import { LureType } from '~/entity/lure.entity';

export class TackleBoxModel {
  id: string;
  lureType: LureType;
  lureColor: string;
  serialCode: string;
  imagePath: string;
  reviewStatus: ReviewStatus;
  isLost: boolean;
  legendary: boolean;
  updatedAt: Date;

  constructor(param: Partial<TackleBoxModel> = {}) {
    Object.assign(this, param);
  }

  static toModel(
    entities: CustomLureDetailWithStatusEntity[],
  ): TackleBoxModel[] {
    return entities.map(
      (e) =>
        new TackleBoxModel({
          id: e.id,
          lureType: LureType[e.lureType],
          lureColor: e.color,
          serialCode: e.serialCode,
          imagePath: e.imagePathForNft,
          reviewStatus: e.status,
          isLost: e.isLost,
          legendary: e.legendary,
          updatedAt: e.updatedAt,
        }),
    );
  }

  static filterCrankbaits(lures: TackleBoxModel[]): TackleBoxModel[] {
    return lures.filter((e) => e.lureType === LureType.W3_CRANKBAIT);
  }

  static filterDraftWakers(lures: TackleBoxModel[]): TackleBoxModel[] {
    return lures.filter((e) => e.lureType === LureType.DRAFT_WAKER);
  }

  static filterOtherLures(lures: TackleBoxModel[]): TackleBoxModel[] {
    return lures.filter((e) => (e.lureType !== LureType.W3_CRANKBAIT) && (e.lureType !== LureType.DRAFT_WAKER));
  }
}
