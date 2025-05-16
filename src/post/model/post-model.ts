export class PostRegisterModel {
  memberId: string;

  comment: string;

  images: string[];

  constructor(param: Partial<PostRegisterModel> = {}) {
    Object.assign(this, param);
  }
}

export class PostModifyModel {
  id: string;

  memberId: string;

  comment: string;

  images: string[];

  constructor(param: Partial<PostModifyModel> = {}) {
    Object.assign(this, param);
  }
}
