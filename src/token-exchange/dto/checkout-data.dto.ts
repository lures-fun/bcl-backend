import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CheckoutDataDto {
  @ApiProperty({
    description: 'Order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Token amount', example: 500 })
  @IsNumber()
  @IsNotEmpty()
  tokenAmount: number;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Product ID',
    example: '456e1234-e89b-12d3-a456-426614174000',
  })
  productId: string;

  solanaTransaction: any;
}
