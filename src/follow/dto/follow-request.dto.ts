import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FollowRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'followedMemberIdは必須です' })
  followedMemberId: string;

  constructor(param: Partial<FollowRequestDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(followedMemberId: string): FollowRequestDto {
    return new FollowRequestDto({ followedMemberId });
  }
}
