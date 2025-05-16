import { ApiProperty } from '@nestjs/swagger';

export class SearchResponseDto {
  @ApiProperty({ example: 'id for search target.' })
  id: string;

  @ApiProperty({ example: 'https://domain.com/test.jpg' })
  imagePath: string;

  @ApiProperty({ example: 'moki' })
  userName: string;

  constructor(param: Partial<SearchResponseDto> = {}) {
    Object.assign(this, param);
  }
}
