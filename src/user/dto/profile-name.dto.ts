import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { USER_NAME_FORMAT } from '~/entity/member.entity';

export class ProfileNameDto {
  @ApiProperty({ example: 'last-name' })
  @MaxLength(32, { message: 'lastNameは32文字までです' })
  @IsNotEmpty({ message: 'lastNameは必須です' })
  lastName: string;

  @ApiProperty({ example: 'first-name' })
  @MaxLength(32, { message: 'firstNameは32文字までです' })
  @IsNotEmpty({ message: 'firstNameは必須です' })
  firstName: string;

  @ApiProperty({ example: 'user-name' })
  @MaxLength(32, { message: 'userNameは32文字までです' })
  @IsNotEmpty({ message: 'userNameは必須です' })
  @Matches(USER_NAME_FORMAT)
  userName: string;

  constructor(param: Partial<ProfileNameDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(lastName: string, firstName: string,userName: string): ProfileNameDto {
    return new ProfileNameDto({ lastName: lastName, firstName: firstName, userName: userName});
  }
}
