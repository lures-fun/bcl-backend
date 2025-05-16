import { LureType } from '~/entity/lure.entity';

export class LureRegisterModel {
  memberId: string;
  lureType: LureType;
  color: string;
  serialCode: string;
  image?: string;

  constructor(param: Partial<LureRegisterModel> = {}) {
    Object.assign(this, param);
  }
}

export class LureModifyModel extends LureRegisterModel {
  id: string;

  constructor(param: Partial<LureModifyModel> = {}) {
    super();
    Object.assign(this, param);
  }
}

export class LurePurchaseModel {
  memberId: string;
  lureType: LureType;
  color: string;
  image?: string;

  constructor(param: Partial<LurePurchaseModel> = {}) {
    Object.assign(this, param);
  }
}
