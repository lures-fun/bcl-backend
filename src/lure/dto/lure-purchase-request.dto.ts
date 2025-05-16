import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LureType } from '~/entity/lure.entity';
import { LurePurchaseModel } from '../model/lure-register-model';

export class lurePurchaseRequestDto {
  @ApiProperty({ enum: LureType })
  @IsEnum(LureType, { message: 'Invalid lure type' })
  lureType: LureType;
  
  @ApiProperty({ example: '01' })
  @IsString()
  color: string;

  @ApiProperty({
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/..',
  })
  @IsOptional()
  image?: string;

  static toPurchaseModel(
    memberId: string,
    dto: lurePurchaseRequestDto,
  ): LurePurchaseModel {
    return new LurePurchaseModel({
      memberId,
      lureType: dto.lureType,
      color: dto.color,
      image: dto.image,
    });
  }
}