import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { PostModifyModel, PostRegisterModel } from '../model/post-model';
import { ApiProperty } from '@nestjs/swagger';

export class PostRequestDto {
  @ApiProperty({ example: '起きたら昼だった' })
  @IsNotEmpty({ message: 'commentは必須です' })
  @MaxLength(2000, {
    message: 'commentは最大2000文字です',
  })
  comment: string;

  @ApiProperty({
    example: [
      'http://127.0.0.1:4566/bcl-image-dev/post/d5f5771d-2ee4-4c9f-9128-971c58a626b9.png',
    ],
  })
  @IsOptional()
  images: string[];

  static toRegisterModel(
    memberId: string,
    dto: PostRequestDto,
  ): PostRegisterModel {
    return new PostRegisterModel({
      memberId,
      ...dto,
    });
  }

  static toModifyModel(
    id: string,
    memberId: string,
    dto: PostRequestDto,
  ): PostModifyModel {
    return new PostModifyModel({
      id,
      memberId,
      ...dto,
    });
  }
}
