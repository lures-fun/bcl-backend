import { ApiProperty } from '@nestjs/swagger';
import { CustomMemberEntity } from '~/entity/custom/custom-member.entity';
import { CustomUserDetailEntity } from '~/entity/custom/user.query-user-detail.entity';
import { Member } from '~/entity/member.entity';

export class ProfileDto {
  @ApiProperty({ example: 'member-id' })
  id: string;
  @ApiProperty({ example: 'user-name' })
  userName: string;
  @ApiProperty({ example: 'last-name' })
  lastName: string;
  @ApiProperty({ example: 'first-name' })
  firstName: string;
  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/profile-icon/d032697e-0973-4ded-9d08-9c6a168a63f8/iwaki.png',
  })
  profileIcon: string;
  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/profile-icon/d032697e-0973-4ded-9d08-9c6a168a63f8/iwaki.png',
  })
  profileImage: string;
  @ApiProperty({ example: 6 })
  fishingCareer: number;
  @ApiProperty({ example: '0007' })
  mainField: string;
  @ApiProperty({ example: '0001' })
  mainRod: string;
  @ApiProperty({ example: '0001' })
  mainReel: string;
  @ApiProperty({ example: '0001' })
  mainLine: string;
  @ApiProperty({ example: '釣り歴は６年です。よろしくお願いします。' })
  introduction: string;
  @ApiProperty({ example: false })
  isGuest: boolean;

  constructor(param: Partial<ProfileDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(memberEntity: Member | CustomMemberEntity): ProfileDto {
    return new ProfileDto({
      ...memberEntity,
      isGuest: memberEntity.walletAddress == null,
    });
  }

  static toResponseSearch(raws: CustomUserDetailEntity[]): ProfileDto[] {
    return raws.map(
      (raw) =>
        new ProfileDto({
          id: raw.id,
          userName: raw.userName,
          lastName: raw.lastName,
          firstName: raw.firstName,
          profileIcon: raw.profileIcon,
          profileImage: raw.profileImage,
          fishingCareer: raw.fishingCareer,
          mainField: raw.mainField,
          mainRod: raw.mainRod,
          mainReel: raw.mainReel,
          mainLine: raw.mainLine,
          introduction: raw.introduction,
        }),
    );
  }
}
