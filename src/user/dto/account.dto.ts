import { IsEmail, IsNotEmpty } from 'class-validator';

export class AccountDto {
  @IsEmail(undefined, { message: 'email形式ではありません' })
  @IsNotEmpty({ message: 'emailは必須です' })
  email: string;

  @IsNotEmpty({ message: 'walletAddressは必須です' })
  walletAddress: string;

  constructor(param: Partial<AccountDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(email: string, walletAddress: string): AccountDto {
    return new AccountDto({ email, walletAddress });
  }
}
