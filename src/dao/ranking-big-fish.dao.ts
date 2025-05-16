import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { renderString } from 'nunjucks';
import { EntityManager } from 'typeorm';
import { CustomRankingBigFish } from '~/entity/custom/custom-ranking.big-fish.entity';
import { LureType } from '~/entity/lure.entity';

@Injectable()
export class RankingBigFishDao {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  public async queryByLureTypes(
    lureTypes: LureType[],
  ): Promise<CustomRankingBigFish[]> {
    const template = readFileSync(
      'src/dao/mapper/ranking-big-fish.query.mapper.sql',
      'utf-8',
    );
    const placeholders = lureTypes.map(() => '?').join(', ');
    const sql = renderString(template, {
      condition: 'lure-type',
      placeholders,
    });
    const res = await this.entityManager.query(sql, lureTypes);
    return CustomRankingBigFish.toCustomEntity(res);
  }

  public async queryByField(field: string): Promise<CustomRankingBigFish[]> {
    const template = readFileSync(
      'src/dao/mapper/ranking-big-fish.query.mapper.sql',
      'utf-8',
    );
    const sql = renderString(template, { condition: 'field' });
    const res = await this.entityManager.query(sql, [field]);
    return CustomRankingBigFish.toCustomEntity(res);
  }

  public async queryByFields(
    fields: string[],
  ): Promise<CustomRankingBigFish[]> {
    const template = readFileSync(
      'src/dao/mapper/ranking-big-fish-of-filed.query.mapper.sql',
      'utf-8',
    );
    const placeholders = fields.map(() => '?').join(', ');
    const sql = renderString(template, { placeholders });
    const res = await this.entityManager.query(sql, fields);
    return CustomRankingBigFish.toCustomEntity(res);
  }
}
