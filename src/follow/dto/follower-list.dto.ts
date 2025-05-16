import { MemberRole } from '~/entity/member.entity';

export class FollowerListDto {
  id: string;

  lastName: string;

  firstName: string;

  userName: string;

  profileIcon: string;

  profileImage: string;

  fishingCareer: number;

  introduction: string;

  role: MemberRole;

  followed: boolean;

  constructor(param: Partial<FollowerListDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(raws: FollowerListDto[]): FollowerListDto[] {
    return raws.map(
      (raw) =>
        new FollowerListDto({
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
