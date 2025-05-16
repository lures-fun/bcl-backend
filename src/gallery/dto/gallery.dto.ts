import { ApiProperty } from '@nestjs/swagger';
import { CustomMemberEntity } from '~/entity/custom/custom-member.entity';
import { CustomMyTrophyEntity } from '~/entity/custom/trophy.query-my-trophy.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { ProfileDto } from '~/user/dto/profile.dto';

class TrophyDto {
  @ApiProperty({ example: 'd032697e-0973-4ded-9d08-9c6a168a63f8' })
  trophyId: string;
  @ApiProperty({ example: 'trophy-title' })
  trophyTitle: string;
  @ApiProperty({ example: 'd032697e-0973-4ded-9d08-9c6a168a63f8' })
  contestId: string;
  @ApiProperty({ example: 'contest-title' })
  contestTitle: string;
  @ApiProperty({ example: 'contest-content' })
  contestContent: string;
  @ApiProperty({ example: 'contest-field' })
  contestField: string;
  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/lure-image-master/W3_CRANKBAIT/W_01_001.png',
  })
  trophyImagePath: string;

  constructor(param: Partial<TrophyDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(trophy: CustomMyTrophyEntity): TrophyDto {
    return new TrophyDto({
      trophyId: trophy.trophyId,
      trophyTitle: trophy.trophyTitle,
      contestId: trophy.contestId,
      contestTitle: trophy.contestTitle,
      contestContent: trophy.contestContent,
      contestField: trophy.contestField,
      trophyImagePath: trophy.imagePath,
    });
  }
}
class FishingResultDto {
  @ApiProperty({ example: 'd032697e-0973-4ded-9d08-9c6a168a63f8' })
  id: string;
  @ApiProperty({ example: 'field' })
  field: string;
  @ApiProperty({ example: 'title' })
  title: string;
  @ApiProperty({ example: 'size' })
  size: number;
  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/lure-image-master/W3_CRANKBAIT/W_01_001.png',
  })
  imagePathForNft: string;
  constructor(param: Partial<FishingResultDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(fishingResultEntity: FishingResult): FishingResultDto {
    return new FishingResultDto({
      id: fishingResultEntity.id,
      field: fishingResultEntity.field,
      title: fishingResultEntity.title,
      size: fishingResultEntity.size,
      imagePathForNft: fishingResultEntity.imagePathForNft,
    });
  }
}
export class GalleryDto {
  @ApiProperty({ type: TrophyDto, isArray: true })
  trophies: TrophyDto[];
  @ApiProperty({ type: FishingResultDto, isArray: true })
  fishingResults: FishingResultDto[];
  @ApiProperty({ type: ProfileDto })
  profile: ProfileDto;
  @ApiProperty({ example: 1 })
  followerCount: number;
  @ApiProperty({ example: 1 })
  followeeCount: number;
  @ApiProperty({ example: 100 })
  biggestFish: number;
  @ApiProperty({ example: true })
  isFollowed: boolean;
  @ApiProperty({ example: 'aaaa' })
  walletAddress: string;

  constructor(param: Partial<GalleryDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(
    trophyEntities: CustomMyTrophyEntity[],
    fishingResultEntities: FishingResult[],
    member: CustomMemberEntity,
    followerCount: number,
    followeeCount: number,
    biggestFish: number,
    isFollowed: boolean,
    walletAddress: string,
  ): GalleryDto {
    return new GalleryDto({
      trophies: trophyEntities.map((e) => TrophyDto.toResponse(e)),
      fishingResults: fishingResultEntities.map((e) =>
        FishingResultDto.toResponse(e),
      ),
      profile: ProfileDto.toResponse(member),
      followerCount: followerCount,
      followeeCount: followeeCount,
      biggestFish: biggestFish,
      isFollowed: isFollowed,
      walletAddress: walletAddress,
    });
  }
}
