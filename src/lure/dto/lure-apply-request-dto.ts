import { BadRequestException } from '@nestjs/common';
import { IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { LureType, SERIAL_CODE_FORMAT } from '~/entity/lure.entity';
import { LureRegisterModel } from '../model/lure-register-model';

const COLOR_LENGTH = 2;

export class LureRegisterRequestDto {
  @IsEnum(LureType, { message: 'Invalid lure type' })
  lureType: LureType;

  @Matches(SERIAL_CODE_FORMAT)
  serialCode: string;

  @IsNotEmpty({ message: 'imageは必須です' })
  image: string;

  static toModel(dto: LureRegisterRequestDto): LureRegisterModel {
    return new LureRegisterModel({
      lureType: dto.lureType,
      color: LureRegisterRequestDto.extractColorFromSerialCode(dto.serialCode),
      serialCode: dto.serialCode,
      image: dto.image,
    });
  }

  private static extractColorFromSerialCode(serialCode: string): string {
    const color = serialCode.slice(0, COLOR_LENGTH);
    if (Number.isNaN(color)) {
      throw new BadRequestException('Serial code must start with [0-9]{2}');
    }

    return color;
  }
}
