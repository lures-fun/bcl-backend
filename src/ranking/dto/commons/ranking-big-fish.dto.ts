import { ApiProperty } from '@nestjs/swagger';
import { LureType } from '~/entity/lure.entity';
import { RankingModel } from '~/ranking/model/ranking.model';

export class RankingBigFish {
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
  @ApiProperty({ example: '780dc8b9-df85-4b93-a101-dd21fdc2bfbf' })
  lureId: string;
  @ApiProperty({ enum: LureType })
  lureType: LureType;
  @ApiProperty({ example: '01' })
  color: string;
  @ApiProperty({ example: '0007' })
  field: string;
  @ApiProperty({ example: 100 })
  size: number;

  constructor(param: Partial<RankingBigFish> = {}) {
    Object.assign(this, param);
  }

  static toResponse(model: RankingModel): RankingBigFish[] {
    return model.bigFishRanking.map(
      (e) =>
        new RankingBigFish({
          ranking: e.ranking,
          memberId: e.memberId,
          userName: e.member.userName,
          profileIcon: e.member.profileIcon,
          lureId: e.lureId,
          lureType: e.lure.lureType,
          color: e.lure.color,
          field: e.field,
          size: e.size,
        }),
    );
  }
}
