import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, Matches } from 'class-validator';
import { LureType, SERIAL_CODE_FORMAT } from '~/entity/lure.entity';
import {
  LureModifyModel,
  LureRegisterModel,
} from '../model/lure-register-model';

const COLOR_LENGTH = 2;

export class LureRegisterRequestDto {
  @ApiProperty({ enum: LureType })
  @IsEnum(LureType, { message: 'Invalid lure type' })
  lureType: LureType;

  @ApiProperty({ example: '01/001' })
  @Matches(SERIAL_CODE_FORMAT)
  serialCode: string;

  @ApiProperty({
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/..',
  })
  @IsOptional()
  image?: string;

  static toRegisterModel(
    memberId: string,
    dto: LureRegisterRequestDto,
  ): LureRegisterModel {
    return new LureRegisterModel({
      memberId,
      lureType: dto.lureType,
      color: LureRegisterRequestDto.extractColorFromSerialCode(dto.serialCode),
      serialCode: dto.serialCode,
      image: dto.image,
    });
  }

  static toModifyModel(
    id: string,
    memberId: string,
    dto: LureRegisterRequestDto,
  ): LureModifyModel {
    return new LureModifyModel({
      id,
      memberId,
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
