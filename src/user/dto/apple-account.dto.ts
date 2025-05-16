import { IsEmail, IsNotEmpty } from 'class-validator';

export class AppleAccountDto {
  @IsEmail(undefined, { message: 'email形式ではありません' })
  @IsNotEmpty({ message: 'emailは必須です' })
  email: string;

  @IsNotEmpty({ message: 'tokenは必須です' })
  token: string;

  constructor(param: Partial<AppleAccountDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(email: string): AppleAccountDto {
    return new AppleAccountDto({ email });
  }
}
