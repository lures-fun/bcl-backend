export class CommentRegisterModel {
  parentId: string;

  parentCommentId: string;

  memberId: string;

  comment: string;

  tokenQuantity?: number;

  constructor(param: Partial<CommentRegisterModel> = {}) {
    Object.assign(this, param);
  }
}
