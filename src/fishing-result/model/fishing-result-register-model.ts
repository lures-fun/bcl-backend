export class FishingResultRegisterModel {
  memberId: string;

  field: string;

  title?: string;

  size: number;

  fishType: string;

  lureId?: string;

  freeTextLure?: string;

  rod: string;

  reel: string;

  line: string;

  imageForApply?: string;

  imageForNft: string;

  imageForSizeConfirmation: string;

  comment?: string;

  caughtAt: Date;

  constructor(param: Partial<FishingResultRegisterModel> = {}) {
    Object.assign(this, param);
  }
}

export class FishingResultModifyModel extends FishingResultRegisterModel {
  id: string;

  constructor(param: Partial<FishingResultModifyModel> = {}) {
    super();
    Object.assign(this, param);
  }
}
