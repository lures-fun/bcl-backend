import { Injectable } from '@nestjs/common';
import { RankingBigFishDao } from '~/dao/ranking-big-fish.dao';
import { RankingFishingCountDao } from '~/dao/ranking-fishing-count.dao';
import { RankingSummaryDao } from '~/dao/ranking-summary.dao';
import { LureType } from '~/entity/lure.entity';
import { LureBaseColorFileNameUtil } from '~/util/lure-base-color-file-name.utils';
import { RankingLureColorModel } from './model/ranking-lure-color.model';
import { RankingModel } from './model/ranking.model';

@Injectable()
export class RankingService {
  constructor(
    private readonly lureBaseColorFileNameUtil: LureBaseColorFileNameUtil,
    private readonly rankingSummaryDao: RankingSummaryDao,
    private readonly rankingBigFishDao: RankingBigFishDao,
    private readonly rankingFishingCountDao: RankingFishingCountDao,
  ) {}

  async getLureTypes(lureTypes: LureType[]): Promise<RankingModel> {
    const [total, bigFishRanking, fishingCountRanking] = await Promise.all([
      this.rankingSummaryDao.countByLureTypes(lureTypes),
      this.rankingBigFishDao.queryByLureTypes(lureTypes),
      this.rankingFishingCountDao.queryByLureTypes(lureTypes),
    ]);
    return RankingModel.toModel(
      lureTypes[0],
      null,
      total,
      bigFishRanking,
      fishingCountRanking,
    );
  }

  async getField(field: string): Promise<RankingModel> {
    const [total, bigFishRanking, fishingCountRanking] = await Promise.all([
      this.rankingSummaryDao.countByField(field),
      this.rankingBigFishDao.queryByField(field),
      this.rankingFishingCountDao.queryField(field),
    ]);
    return RankingModel.toModel(
      null,
      field,
      total,
      bigFishRanking,
      fishingCountRanking,
    );
  }

  async getFields(fields: string[]): Promise<RankingModel[]> {
    const [summary, bigFishResult, fishingResult] = await Promise.all([
      this.rankingSummaryDao.countByFields(fields),
      this.rankingBigFishDao.queryByFields(fields),
      this.rankingFishingCountDao.queryFields(fields),
    ]);
    return RankingModel.toModels(fields, summary, bigFishResult, fishingResult);
  }

  async getLureColors(lureTypes: LureType[]): Promise<RankingLureColorModel> {
    const [total, lures] = await Promise.all([
      this.rankingSummaryDao.countByLureTypes(lureTypes),
      this.rankingFishingCountDao.queryLureColorByLureType(lureTypes),
    ]);
    const imageNames = await Promise.all(
      lures.map((e) =>
        this.lureBaseColorFileNameUtil.getImageName(
          e.lureType,
          e.color,
          e.fileName,
        ),
      ),
    );
    return RankingLureColorModel.toModel(total, lures, imageNames);
  }
}
