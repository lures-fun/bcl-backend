import { ApiProperty } from '@nestjs/swagger';
import { Trophy } from '~/entity/trophy.entity';

export class TrophyDetailDto extends Trophy {
  @ApiProperty()
  size: number;
  @ApiProperty()
  caughtAt: Date;
  @ApiProperty()
  field: string;
  @ApiProperty()
  fishType: string;
  @ApiProperty()
  freeTextLure: string;
  @ApiProperty()
  rod: string;
  @ApiProperty()
  reel: string;
  @ApiProperty()
  line: string;

  constructor(param: Partial<TrophyDetailDto> = {}) {
    super();
    Object.assign(this, param);
  }

  static toResponse(raw: any): TrophyDetailDto {
    return new TrophyDetailDto(raw);
  }
}
