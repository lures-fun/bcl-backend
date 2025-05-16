import { CustomFishingResultWithMintEntity } from '~/entity/custom/fishing.query-fishing-result-with-mint.entity';

export class FishingResultModel {
  id: string;
  memberId: string;
  userName: string;
  field: string;
  title: string;
  size: number;
  fishType: string;
  lureId: string;
  rod: string;
  line: string;
  reel: string;
  imagePathForApply: string;
  imagePathForNft: string;
  comment: string;
  caughtAt: Date;
  mintId: string;

  constructor(param: Partial<FishingResultModel> = {}) {
    Object.assign(this, param);
  }

  static toModel(
    entities: CustomFishingResultWithMintEntity[],
  ): FishingResultModel[] {
    return entities.map(
      (e) =>
        new FishingResultModel({
          id: e.id,
          memberId: e.memberId,
          userName: e.userName,
          field: e.field,
          title: e.title,
          size: e.size,
          fishType: e.fishType,
          lureId: e.lureId,
          rod: e.rod,
          line: e.line,
          reel: e.reel,
          imagePathForApply: e.imagePathForApply,
          imagePathForNft: e.imagePathForNft,
          comment: e.comment,
          caughtAt: e.caughtAt,
          mintId: e.mintId,
        }),
    );
  }
}
