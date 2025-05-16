import { CustomFollowUnionSearchEntity } from '~/entity/custom/custom-follow-union-search.entity';

export class UnionSearchResponseDto {
  id: string;
  lastName: string;
  firstName: string;
  userName: string;
  profileIcon: string;
  profileImage: string;
  followed: string;
  follower: string;

  constructor(param: Partial<UnionSearchResponseDto> = {}) {
    Object.assign(this, param);
  }

  static of(entity: CustomFollowUnionSearchEntity[]): UnionSearchResponseDto[] {
    return entity.map(
      (raw) =>
        new UnionSearchResponseDto({
          id: raw.id,
          lastName: raw.lastName,
          firstName: raw.firstName,
          userName: raw.userName,
          profileIcon: raw.profileIcon,
          profileImage: raw.profileImage,
          followed: raw.followed,
          follower: raw.follower,
        }),
    );
  }
}
