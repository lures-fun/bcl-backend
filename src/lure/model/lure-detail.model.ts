import { CustomLureDetailWithStatusEntity } from '~/entity/custom/lure.query-lure-with-status.entity';
import { ReviewStatus } from '~/entity/lure-review-status.entity';
import { LureType } from '~/entity/lure.entity';

export class LureDetailModel {
  id: string;
  userName?: string;
  lureColor: string;
  serialCode: string;
  lureType: LureType;
  imagePath: string;
  imagePathForApply: string;
  reviewStatus: ReviewStatus;
  bigfish: number;
  purchasedAt: Date;
  isLost: boolean;
  legendary: boolean;

  constructor(param: Partial<LureDetailModel> = {}) {
    Object.assign(this, param);
  }

  static toModel(
    lureEntity: CustomLureDetailWithStatusEntity,
    bigfish: number,
  ): LureDetailModel {
    return new LureDetailModel({
      id: lureEntity.id,
      userName: lureEntity.userName,
      lureColor: lureEntity.color,
      serialCode: lureEntity.serialCode,
      lureType: LureType[lureEntity.lureType],
      imagePath: lureEntity.imagePathForNft,
      imagePathForApply: lureEntity.imagePathForApply,
      reviewStatus: lureEntity.status,
      purchasedAt: lureEntity.purchasedAt,
      isLost: lureEntity.isLost,
      bigfish,
      legendary: lureEntity.legendary
    });
  }
}
