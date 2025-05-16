import { ApiProperty } from '@nestjs/swagger';
import { LureType } from '~/entity/lure.entity';
import { LureDetailModel } from '../model/lure-detail.model';

export class LureDetailDto {
  @ApiProperty({ example: 'd032697e-0973-4ded-9d08-9c6a168a63f8' })
  id: string;
  @ApiProperty({ example: 'user-name' })
  userName?: string;
  @ApiProperty({ example: '01' })
  lureColor: string;
  @ApiProperty({ example: '01/001' })
  serialCode: string;
  @ApiProperty({ enum: LureType })
  lureType: LureType;
  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/lure-image-master/W3_CRANKBAIT/W_01_001.png',
  })
  imagePath: string;
  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/lure/7dfff360-acba-4dea-9779-27a6c0a6f166.jpeg',
  })
  imagePathForApply: string;
  @ApiProperty({ example: 'APPLY' })
  reviewStatus: string;
  @ApiProperty({ example: null })
  bigfish: number;
  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  purchasedAt: Date;
  @ApiProperty({ example: true })
  isLost: boolean;
  @ApiProperty({ example: true })
  legendary: boolean;

  constructor(param: Partial<LureDetailDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(lure: LureDetailModel): LureDetailDto {
    return new LureDetailDto({
      id: lure.id,
      userName: lure.userName,
      lureColor: lure.lureColor,
      serialCode: lure.serialCode,
      lureType: lure.lureType,
      imagePath: lure.imagePath,
      imagePathForApply: lure.imagePathForApply,
      reviewStatus: lure.reviewStatus,
      bigfish: lure.bigfish,
      purchasedAt: lure.purchasedAt,
      isLost: lure.isLost,
      legendary: lure.legendary
    });
  }
}
