import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: '合計トークン数' })
  @IsNumber()
  totalTokens: number;
}
