import { CustomMemberListEntity } from '~/entity/custom/custom-member-list.entity';
import { MemberRole } from '~/entity/member.entity';

export class GoodMemberListModel {
  id: string;

  walletAddress: string;

  email: string;

  lastName: string;

  firstName: string;

  userName: string;

  profileIcon: string;

  profileImage: string;

  fishingCareer: number;

  introduction: string;

  role: MemberRole;

  followed: boolean;

  constructor(param: Partial<GoodMemberListModel> = {}) {
    Object.assign(this, param);
  }

  static toModel(raws: CustomMemberListEntity[]): GoodMemberListModel[] {
    return raws.map(
      (raw) =>
        new GoodMemberListModel({
          id: raw.id,
          walletAddress: raw.walletAddress,
          email: raw.email,
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
