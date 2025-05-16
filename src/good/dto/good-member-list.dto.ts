import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '~/entity/member.entity';
import { GoodMemberListModel } from '../model/good-member-list.model';

export class GoodMemberListDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  userName: string;
  @ApiProperty()
  profileIcon: string;
  @ApiProperty()
  profileImage: string;
  @ApiProperty()
  fishingCareer: number;
  @ApiProperty()
  introduction: string;
  @ApiProperty({ enum: MemberRole })
  role: MemberRole;
  @ApiProperty()
  followed: boolean;

  constructor(param: Partial<GoodMemberListDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(raws: GoodMemberListModel[]): GoodMemberListDto[] {
    return raws.map(
      (raw) =>
        new GoodMemberListDto({
          id: raw.id,
          lastName: raw.lastName,
          firstName: raw.firstName,
          userName: raw.userName,
          profileIcon: raw.profileIcon,
          profileImage: raw.profileImage,
          fishingCareer: raw.fishingCareer,
          role: raw.role,
          followed: raw.followed,
        }),
    );
  }
}
