import { ApiProperty } from '@nestjs/swagger';
import { LureType } from '~/entity/lure.entity';
import { RankingLureColorModel } from '~/ranking/model/ranking-lure-color.model';

export class RankingLure {
  @ApiProperty({ example: '01' })
  color: string;
  @ApiProperty({ enum: LureType })
  lureType: LureType;
  @ApiProperty({
    example:
      'http://127.0.0.1:4566/bcl-image-dev/lure-image-master/W3_CRANKBAIT/W3_CRANKBAIT_01.png',
  })
  imagePathForNft: string;
  @ApiProperty({ example: 1 })
  fishingCount: number;

  constructor(param: Partial<RankingLure> = {}) {
    Object.assign(this, param);
  }

  static toResponse(model: RankingLureColorModel): RankingLure[] {
    return model.fishingCountRanking.map(
      (e) =>
        new RankingLure({
          color: e.color,
          lureType: e.lureType,
          imagePathForNft: e.imagePathForNft,
          fishingCount: e.fishingCount,
        }),
    );
  }
}
