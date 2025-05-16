import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AnglerDto {
  @ApiProperty({ example: 6 })
  @IsInt({ message: 'fishingCareerは数値で入力してください' })
  @Min(0, { message: 'fishingCareerは0以上の整数を入力してください' })
  @Max(100, { message: 'fishingCareerは100以下の整数を入力してください' })
  fishingCareer: number;

  @ApiProperty({ example: '0007' })
  @IsNotEmpty({ message: 'mainFieldは必須です' })
  @Length(4, undefined, { message: 'mainFieldは4文字で入力してください' })
  @IsNotEmpty()
  mainField: string;

  @ApiProperty({ example: '0001' })
  @IsNotEmpty({ message: 'mainRodは必須です' })
  @Length(4, undefined, { message: 'mainRodは4文字で入力してください' })
  mainRod: string;

  @ApiProperty({ example: '0001' })
  @IsNotEmpty({ message: 'mainReelは必須です' })
  @Length(4, undefined, { message: 'mainReelは4文字で入力してください' })
  mainReel: string;

  @ApiProperty({ example: '0001' })
  @IsNotEmpty({ message: 'mainLineは必須です' })
  @Length(4, undefined, { message: 'mainLineは4文字で入力してください' })
  mainLine: string;

  @ApiProperty({ example: '釣り歴は６年です。よろしくお願いします。' })
  @MaxLength(2000, { message: 'introductionは2000文字までです' })
  introduction: string;

  constructor(param: Partial<AnglerDto> = {}) {
    Object.assign(this, param);
  }
}
