import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class UnionSearchRequestDto {
  @ApiProperty({ example: 'jon' })
  @IsOptional()
  @MaxLength(64, { message: 'searchTextは64文字までです' })
  searchText: string;

  @ApiProperty({ example: 100 })
  @IsOptional()
  limit?: number;

  constructor(param: Partial<UnionSearchRequestDto> = {}) {
    Object.assign(this, param);
  }
}
