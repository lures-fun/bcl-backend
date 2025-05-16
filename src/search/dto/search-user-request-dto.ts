import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class SearchUserRequestDto {
  @ApiProperty({ example: 'user-name' })
  @IsOptional()
  @MaxLength(64, { message: 'searchTextは64文字までです' })
  searchText: string;

  constructor(param: Partial<SearchUserRequestDto> = {}) {
    Object.assign(this, param);
  }
}
