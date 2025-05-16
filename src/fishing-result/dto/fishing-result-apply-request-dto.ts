import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FishType } from '~/constants/fish-type';
import { ID_REG_EXP } from '~/constants/master-regexp';
import { DateUtils } from '~/util/date.utils';
import {
  FishingResultModifyModel,
  FishingResultRegisterModel,
} from '../model/fishing-result-register-model';

export class FishingResultApplyRequestDto {
  @ApiProperty({ example: 2023 })
  @IsNumber()
  // 現実的な年数でバリデーションを行う
  @Min(2000, {
    message: 'caughtYearAtは2000以上の数値で入力してください',
  })
  @Max(3000, {
    message: 'caughtYearAtは3000以下の数値で入力してください',
  })
  caughtYearAt: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1, {
    message: 'caughtMonthAtは1以上の数値で入力してください',
  })
  @Max(12, {
    message: 'caughtMonthAtは12以下の数値で入力してください',
  })
  caughtMonthAt: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(1, {
    message: 'caughtDayAtは1以上の数値で入力してください',
  })
  @Max(31, {
    message: 'caughtDayAtは31以下の数値で入力してください',
  })
  caughtDayAt: number;

  @ApiProperty({ example: '0001' })
  @IsNotEmpty({ message: 'fieldは必須です' })
  @Matches(ID_REG_EXP)
  field: string;

  @ApiProperty({ example: 42 })
  @Min(1, {
    message: 'sizeは1以上の数値で入力してください',
  })
  @IsNumber()
  size: number;

  @ApiProperty({ example: '1' })
  @IsNotEmpty({ message: 'fishTypeは必須です' })
  @Matches(FishType.REG_EXP)
  fishType: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'lureIdは必須です' })
  lureId: string;

  @ApiProperty({ example: '0001' })
  @IsNotEmpty({ message: 'rodは必須です' })
  @Matches(ID_REG_EXP)
  rod: string;

  @ApiProperty({ example: '0001' })
  @IsNotEmpty({ message: 'reelは必須です' })
  @Matches(ID_REG_EXP)
  reel: string;

  @ApiProperty({ example: '0001' })
  @IsNotEmpty({ message: 'lineは必須です' })
  @Matches(ID_REG_EXP)
  line: string;

  @ApiProperty({ example: 'title' })
  @IsNotEmpty({ message: 'titleは必須です' })
  @MaxLength(10, {
    message: 'titleは最大10文字です',
  })
  title: string;

  @ApiPropertyOptional({ example: 'just comment.' })
  @IsOptional()
  @MaxLength(2000, {
    message: 'commentは最大2000文字です',
  })
  comment?: string;

  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/post/d5f5771d-2ee4-4c9f-9128-971c58a626b9.png',
  })
  @IsNotEmpty({ message: 'imageForApplyは必須です' })
  imageForApply: string;

  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/post/d5f5771d-2ee4-4c9f-9128-971c58a626b9.png',
  })
  @IsNotEmpty({ message: 'imageForNftは必須です' })
  imageForNft: string;

  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/post/d5f5771d-2ee4-4c9f-9128-971c58a626b9.png',
  })
  @IsNotEmpty({ message: 'imageForSizeConfirmationは必須です' })
  imageForSizeConfirmation: string;

  constructor(param: Partial<FishingResultApplyRequestDto>) {
    Object.assign(this, param);
  }

  static toRegisterModel(
    memberId: string,
    dto: FishingResultApplyRequestDto,
  ): FishingResultRegisterModel {
    return new FishingResultRegisterModel({
      memberId,
      caughtAt: DateUtils.buildDate(
        dto.caughtYearAt,
        dto.caughtMonthAt,
        dto.caughtDayAt,
      ),
      ...dto,
    });
  }

  static toModifyModel(
    id: string,
    memberId: string,
    dto: FishingResultApplyRequestDto,
  ): FishingResultModifyModel {
    return new FishingResultModifyModel({
      id,
      memberId,
      caughtAt: DateUtils.buildDate(
        dto.caughtYearAt,
        dto.caughtMonthAt,
        dto.caughtDayAt,
      ),
      ...dto,
    });
  }
}

export class FishingResultApplyRequestForOtherLuresDto {
  @ApiProperty({ example: 2023 })
  @IsNumber()
  // 現実的な年数でバリデーションを行う
  @Min(2000, {
    message: 'caughtYearAtは2000以上の数値で入力してください',
  })
  @Max(3000, {
    message: 'caughtYearAtは3000以下の数値で入力してください',
  })
  caughtYearAt: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1, {
    message: 'caughtMonthAtは1以上の数値で入力してください',
  })
  @Max(12, {
    message: 'caughtMonthAtは12以下の数値で入力してください',
  })
  caughtMonthAt: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(1, {
    message: 'caughtDayAtは1以上の数値で入力してください',
  })
  @Max(31, {
    message: 'caughtDayAtは31以下の数値で入力してください',
  })
  caughtDayAt: number;

  @ApiProperty({ example: '0001' })
  @IsNotEmpty({ message: 'fieldは必須です' })
  @Matches(ID_REG_EXP)
  field: string;

  @ApiProperty({ example: 42 })
  @Min(1, {
    message: 'sizeは1以上の数値で入力してください',
  })
  @IsNumber()
  size: number;

  @ApiProperty({ example: '1' })
  @IsNotEmpty({ message: 'fishTypeは必須です' })
  @Matches(FishType.REG_EXP)
  fishType: string;

  @ApiProperty({ example: 'メガバス' })
  @IsNotEmpty({ message: 'freeTextLureは必須です' })
  freeTextLure: string;

  @ApiProperty({ example: '0001' })
  @IsNotEmpty({ message: 'rodは必須です' })
  @Matches(ID_REG_EXP)
  rod: string;

  @ApiProperty({ example: '0001' })
  @IsNotEmpty({ message: 'reelは必須です' })
  @Matches(ID_REG_EXP)
  reel: string;

  @ApiProperty({ example: '0001' })
  @IsNotEmpty({ message: 'lineは必須です' })
  @Matches(ID_REG_EXP)
  line: string;

  @ApiProperty({ example: 'title' })
  @IsNotEmpty({ message: 'titleは必須です' })
  @MaxLength(10, {
    message: 'titleは最大10文字です',
  })
  title: string;

  @ApiProperty({ example: 'just comment.' })
  @IsOptional()
  @MaxLength(2000, {
    message: 'commentは最大2000文字です',
  })
  comment?: string;

  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/post/d5f5771d-2ee4-4c9f-9128-971c58a626b9.png',
  })
  @IsNotEmpty({ message: 'imageForNftは必須です' })
  imageForNft: string;

  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/post/d5f5771d-2ee4-4c9f-9128-971c58a626b9.png',
  })
  @IsNotEmpty({ message: 'imageForSizeConfirmationは必須です' })
  imageForSizeConfirmation: string;

  constructor(param: Partial<FishingResultApplyRequestForOtherLuresDto>) {
    Object.assign(this, param);
  }

  static toRegisterModel(
    memberId: string,
    dto: FishingResultApplyRequestForOtherLuresDto,
  ): FishingResultRegisterModel {
    return new FishingResultRegisterModel({
      memberId,
      caughtAt: DateUtils.buildDate(
        dto.caughtYearAt,
        dto.caughtMonthAt,
        dto.caughtDayAt,
      ),
      field: dto.field,
      title: dto.title,
      size: dto.size,
      fishType: dto.fishType,
      freeTextLure: dto.freeTextLure,
      rod: dto.rod,
      reel: dto.reel,
      line: dto.line,
      imageForNft: dto.imageForNft,
      imageForSizeConfirmation: dto.imageForSizeConfirmation,
      comment: dto.comment,
    });
  }

  static toModifyModel(
    id: string,
    memberId: string,
    dto: FishingResultApplyRequestForOtherLuresDto,
  ): FishingResultModifyModel {
    return new FishingResultModifyModel({
      id,
      memberId,
      caughtAt: DateUtils.buildDate(
        dto.caughtYearAt,
        dto.caughtMonthAt,
        dto.caughtDayAt,
      ),
      field: dto.field,
      title: dto.title,
      size: dto.size,
      fishType: dto.fishType,
      freeTextLure: dto.freeTextLure,
      rod: dto.rod,
      reel: dto.reel,
      line: dto.line,
      imageForNft: dto.imageForNft,
      imageForSizeConfirmation: dto.imageForSizeConfirmation,
      comment: dto.comment,
    });
  }
}
