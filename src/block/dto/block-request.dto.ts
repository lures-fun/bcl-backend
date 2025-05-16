import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BlockRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'blockedMemberIdは必須です' })
  blockedMemberId: string;

  constructor(param: Partial<BlockRequestDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(blockedMemberId: string): BlockRequestDto {
    return new BlockRequestDto({ blockedMemberId });
  }
}
