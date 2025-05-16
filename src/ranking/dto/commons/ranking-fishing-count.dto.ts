import { ApiProperty } from '@nestjs/swagger';
import { RankingModel } from '~/ranking/model/ranking.model';

export class RankingFishingCount {
  @ApiProperty({ example: 1 })
  ranking: number;
  @ApiProperty({ example: 'aba22368-65a3-43cb-a8ce-0f198aacffb3' })
  memberId: string;
  @ApiProperty({ example: 'test' })
  userName: string;
  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/lure/780dc8b9-df85-4b93-a101-dd21fdc2bfbf.jpeg',
  })
  profileIcon: string;
  @ApiProperty({ example: 1 })
  fishingCount: number;

  constructor(param: Partial<RankingFishingCount> = {}) {
    Object.assign(this, param);
  }

  static toResponse(model: RankingModel): RankingFishingCount[] {
    return model.fishingCountRanking.map(
      (e) =>
        new RankingFishingCount({
          ranking: e.ranking,
          memberId: e.id,
          userName: e.userName,
          profileIcon: e.profileIcon,
          fishingCount: e.fishingCount,
        }),
    );
  }
}
