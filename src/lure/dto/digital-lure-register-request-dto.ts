import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class DigitalLureRegisterRequestDto {
  @ApiProperty({ example: 'aba22368-65a3-43cb-a8ce-0f198aacffb3' })
  @IsNotEmpty({ message: 'MemberIdは必須です' })
  memberId: string;

  @ApiProperty({
    example: {
      '9221587632420': '2',
      '9221587534116': '1',
    },
  })
  @IsObject({ message: 'ProductIdsはオブジェクトでなければなりません' })
  productIds: Record<string, string>;
}
