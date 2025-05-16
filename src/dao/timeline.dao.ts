import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { EntityManager } from 'typeorm';
import { Timeline } from '~/entity/custom/timeline.entity';

@Injectable()
export class TimelineDao {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  public async selectTimelines(
    memberId: string,
    limit: number,
    offset: number,
  ): Promise<Timeline[]> {
    const sql = readFileSync(
      'src/dao/mapper/timeline.query-all.mapper.sql',
      'utf-8',
    );
    const raws = await this.entityManager.query(sql, [
      memberId,
      memberId,
      memberId,
      memberId,
      memberId,
      memberId,
      limit,
      offset,
    ]);
    return Timeline.toEntities(raws);
  }

  public async selectTimelinesByFollowedMember(
    memberId: string,
  ): Promise<Timeline[]> {
    const sql = readFileSync(
      'src/dao/mapper/timeline.query-timelines-by-memberid.mapper.sql',
      'utf-8',
    );
    const raws = await this.entityManager.query(sql, [
      memberId,
      memberId,
      memberId,
      memberId,
    ]);
    return Timeline.toEntities(raws);
  }

  public async countFishingResultTimelinesByFollowedMember(
    memberId: string,
    lastReadAt: Date,
  ): Promise<number> {
    const sql = readFileSync(
      'src/dao/mapper/timeline.count-fishing-result-timelines-unread.mapper.sql',
      'utf-8',
    );
    const raws = await this.entityManager.query(sql, [memberId, lastReadAt]);
    return raws[0]['count(*)'];
  }

  public async countSNSTimelinesByFollowedMember(
    memberId: string,
    lastReadAt: Date,
  ): Promise<number> {
    const sql = readFileSync(
      'src/dao/mapper/timeline.count-sns-timelines-unread.mapper.sql',
      'utf-8',
    );
    const raws = await this.entityManager.query(sql, [memberId, lastReadAt]);
    return raws[0]['count(*)'];
  }

  public async countTimelines(memberId: string): Promise<number> {
    const sql = readFileSync(
      'src/dao/mapper/timeline.count-all.mapper.sql',
      'utf-8',
    );
    const result = await this.entityManager.query(sql, [memberId, memberId]);
    return result[0]?.count || 0;
  }
}
