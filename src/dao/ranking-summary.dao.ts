import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { renderString } from 'nunjucks';
import { EntityManager } from 'typeorm';
import { LureType } from '~/entity/lure.entity';

@Injectable()
export class RankingSummaryDao {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  public async countByLureTypes(lureTypes: LureType[]): Promise<number> {
    const template = readFileSync(
      'src/dao/mapper/ranking-summary.count.mapper.sql',
      'utf-8',
    );
    const placeholders = lureTypes.map(() => '?').join(', ');
    const sql = renderString(template, {
      condition: 'lure-type',
      placeholders,
    });
    const res = await this.entityManager.query(sql, lureTypes);
    return parseInt(res[0].fishing_count, 10);
  }

  public async countByField(field: string): Promise<number> {
    const template = readFileSync(
      'src/dao/mapper/ranking-summary.count.mapper.sql',
      'utf-8',
    );
    const sql = renderString(template, { condition: 'field' });
    const res = await this.entityManager.query(sql, [field]);
    return parseInt(res[0].fishing_count, 10);
  }

  public async countByFields(fields: string[]): Promise<Map<string, number>> {
    const template = readFileSync(
      'src/dao/mapper/ranking-summary-of-field.count.mapper.sql',
      'utf-8',
    );
    const placeholders = fields.map(() => '?').join(', ');
    const sql = renderString(template, { placeholders });
    const res: { field: string; fishing_count: number }[] =
      await this.entityManager.query(sql, fields);
    return res.reduce((map, result) => {
      const { field, fishing_count } = result;
      if (!map.has(field)) {
        map.set(field, fishing_count);
      }
      return map;
    }, new Map<string, number>());
  }
}
