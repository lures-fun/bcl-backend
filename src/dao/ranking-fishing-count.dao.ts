import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { renderString } from 'nunjucks';
import { EntityManager } from 'typeorm';
import { CustomFishingCountOfLure } from '~/entity/custom/custom-ranking.fishing-count-of-lure';
import { CustomFishingCountOfMember as CustomFishingCount } from '~/entity/custom/custom-ranking.fishing-count-of-member.entity';
import { LureType } from '~/entity/lure.entity';

@Injectable()
export class RankingFishingCountDao {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  public async queryByLureTypes(
    lureTypes: LureType[],
  ): Promise<CustomFishingCount[]> {
    const template = readFileSync(
      'src/dao/mapper/ranking-fishing-count.query.mapper.sql',
      'utf-8',
    );
    const placeholders = lureTypes.map(() => '?').join(', ');
    const sql = renderString(template, {
      condition: 'lure-type',
      placeholders,
    });
    const res = await this.entityManager.query(sql, lureTypes);
    return CustomFishingCount.toCustomEntity(res);
  }

  public async queryField(field: string): Promise<CustomFishingCount[]> {
    const template = readFileSync(
      'src/dao/mapper/ranking-fishing-count.query.mapper.sql',
      'utf-8',
    );
    const sql = renderString(template, { condition: 'field' });
    const res = await this.entityManager.query(sql, [field]);
    return CustomFishingCount.toCustomEntity(res);
  }

  public async queryFields(fields: string[]): Promise<CustomFishingCount[]> {
    const template = readFileSync(
      'src/dao/mapper/ranking-fishing-count-of-field.query.mapper.sql',
      'utf-8',
    );
    const placeholders = fields.map(() => '?').join(', ');
    const sql = renderString(template, { placeholders });
    const res = await this.entityManager.query(sql, fields);
    return CustomFishingCount.toCustomEntity(res);
  }

  public async queryLureColorByLureType(
    lureTypes: LureType[],
  ): Promise<CustomFishingCountOfLure[]> {
    const template = readFileSync(
      'src/dao/mapper/ranking-fishing-count-of-lure.query.mapper.sql',
      'utf-8',
    );
    const placeholders_from_color = lureTypes.map(() => '?').join(', ');
    const placeholders_from_lure = lureTypes.map(() => '?').join(', ');
    const sql = renderString(template, {
      placeholders_from_color,
      placeholders_from_lure,
    });
    const res = await this.entityManager.query(sql, [
      ...lureTypes,
      ...lureTypes,
    ]);
    return CustomFishingCountOfLure.toCustomEntity(res);
  }
}
