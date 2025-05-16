import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: '商品ID' })
  productId: string;

  @ApiProperty({ description: '数量' })
  @IsInt()
  quantity: number;

  @ApiProperty({ description: 'ステータス' })
  @IsString()
  status: string;
}
