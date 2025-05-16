import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, MaxLength, Min } from 'class-validator';
import { CommentRegisterModel } from '~/comment/model/comment-model';

export class CommentRequestDto {
  @ApiProperty({ example: 'just comment.' })
  @IsNotEmpty({ message: 'commentは必須です' })
  @MaxLength(2000, {
    message: 'commentは最大2000文字です',
  })
  comment: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNotEmpty({ message: 'tokenQuantityは必須です' })
  @IsInt({ message: 'tokenQuantityには整数を入力してください' })
  @Min(0, { message: 'tokenQuantityには0~10の整数を入力してください' })
  @Max(10, { message: 'tokenQuantityには0~10の整数を入力してください' })
  tokenQuantity?: number;

  static toRegisterModel(
    memberId: string,
    parentId: string,
    parentCommentId: string,
    dto: CommentRequestDto,
  ): CommentRegisterModel {
    return new CommentRegisterModel({
      memberId,
      parentId,
      parentCommentId,
      ...dto,
    });
  }
}
