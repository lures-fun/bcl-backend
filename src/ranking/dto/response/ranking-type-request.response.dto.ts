import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { LureType } from '~/entity/lure.entity';

export class RankingTypesRequestDto {
  @ApiProperty({ example: ['HYOUSOU_BAKA_ICHIDAI', 'RANKAKU_80'] })
  @IsNotEmpty()
  @IsArray()
  lureTypes: LureType[];
}