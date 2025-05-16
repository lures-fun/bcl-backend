import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, Matches } from 'class-validator';
import { ID_REG_EXP } from '~/constants/master-regexp';

export class RankingFieldsRequestDto {
  @ApiProperty({ example: ['0007', '0008'] })
  @IsNotEmpty()
  @IsArray()
  @Matches(ID_REG_EXP, undefined, { each: true })
  fields: string[];
}
