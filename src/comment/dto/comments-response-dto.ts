import { CommentType } from '~/entity/comment.entity';
import { CustomCommentThreadsEntity } from '~/entity/custom/custom-comment-threds.entity';
import { CustomCommentWithProfileIconEntity } from '~/entity/custom/custom-comment-with-profile-icon.entity';

export class CommentsResponseDto {
  id: string;
  parentId: string;
  parentCommentId: string;
  memberId: string;
  type: CommentType;
  comment: string;
  tokenQuantity?: number;
  deletedAt: Date;

  profileIcon: string;
  userName: string;
  replyCount: string;
  threads: CustomCommentThreadsEntity[];

  constructor(param: Partial<CommentsResponseDto> = {}) {
    Object.assign(this, param);
  }

  static of(
    comments: CustomCommentWithProfileIconEntity[],
    threads: CustomCommentThreadsEntity[],
  ): CommentsResponseDto[] {
    return comments.map((comment) => {
      const dto = new CommentsResponseDto();
      Object.assign(dto, comment);
      dto.threads = threads.filter(
        (thread) => thread.parentCommentId === comment.id,
      );
      return dto;
    });
  }
}
