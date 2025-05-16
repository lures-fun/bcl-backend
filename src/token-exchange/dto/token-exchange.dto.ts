import { IsNumber, IsString } from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  tokenId: string;
  @IsString()
  userId: string;
  @IsNumber()
  tokenAmount: number;

  constructor(param: Partial<CreateDiscountDto> = {}) {
    Object.assign(this, param);
  }
}
