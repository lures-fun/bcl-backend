import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

enum LanguageCode {
  EN = 'en',
  JA = 'ja',
  // 他の言語コードをここに追加
}

export class TranslateDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  texts: string[];

  @ApiProperty()
  @IsString()
  targetLanguage: LanguageCode;

  constructor(param: Partial<TranslateDto> = {}) {
    Object.assign(this, param);
  }
}
