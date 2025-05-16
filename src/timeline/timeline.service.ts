import { Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { TimelineAlreadyReadDao } from '~/dao/timeline-already-read.dao';
import { TimelineDao } from '~/dao/timeline.dao';
import { Timeline } from '~/entity/custom/timeline.entity';
import {
  TimelineAlreadyRead,
  Type,
} from '~/entity/timeline-already-read.entity';
import { PageDto } from './dto/page.dto';
import { PageMetaDto } from './dto/page-meta.dto';
import { PageOptionsDto } from './dto/page-options.dto';

@Injectable()
export class TimelineService {
  constructor(
    private readonly timelineDao: TimelineDao,
    private readonly timelineAlreadyReadDao: TimelineAlreadyReadDao,
  ) {}

  async getTimelines(
    memberId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Timeline>> {
    const page = pageOptionsDto.page;
    const limit = pageOptionsDto.limit;
    const offset = (page - 1) * limit;
    const totalItems = await this.timelineDao.countTimelines(memberId);
    const pageMetaDto = new PageMetaDto({ totalItems, pageOptionsDto });
    const timelines = await this.timelineDao.selectTimelines(
      memberId,
      limit,
      offset,
    );
    return new PageDto(timelines, pageMetaDto);
  }

  async getFollowerTimelines(memberId: string): Promise<Timeline[]> {
    const result = await this.timelineDao.selectTimelinesByFollowedMember(
      memberId,
    );
    await this.saveTimelineAlreadyRead(memberId, Type.FISHING_RESULT);
    await this.saveTimelineAlreadyRead(memberId, Type.SNS);
    return result;
  }
  async hasUnreadTimeline(memberId: string): Promise<boolean> {
    const hasUnreadFishResult = await this.hasUnreadTimelineByType(
      memberId,
      Type.FISHING_RESULT,
    );
    const hasUnreadSns = await this.hasUnreadTimelineByType(memberId, Type.SNS);
    return hasUnreadFishResult || hasUnreadSns;
  }

  private async hasUnreadTimelineByType(
    memberId: string,
    type: Type,
  ): Promise<boolean> {
    const timelineAlreadyRead =
      await this.timelineAlreadyReadDao.findByMemberId(memberId, type);
    if (!timelineAlreadyRead) {
      const result = await this.hasUnreadTimelineByLastReadAt(
        memberId,
        type,
        TimelineAlreadyRead.INITIAL_DATE,
      );
      await this.saveTimelineAlreadyRead(memberId, type);
      return result;
    }

    return await this.hasUnreadTimelineByLastReadAt(
      memberId,
      type,
      timelineAlreadyRead.lastReadAt,
    );
  }

  private async hasUnreadTimelineByLastReadAt(
    memberId: string,
    type: Type,
    lastReadAt: Date,
  ): Promise<boolean> {
    let unreadCount = 0;
    switch (type) {
      case Type.FISHING_RESULT:
        unreadCount =
          await this.timelineDao.countFishingResultTimelinesByFollowedMember(
            memberId,
            lastReadAt,
          );
        return unreadCount > 0;
      case Type.SNS:
        unreadCount = await this.timelineDao.countSNSTimelinesByFollowedMember(
          memberId,
          lastReadAt,
        );
        return unreadCount > 0;
      default:
        throw new Error(`Unexpected type.${type}`);
    }
  }

  private async saveTimelineAlreadyRead(memberId: string, type: Type) {
    try {
      await this.timelineAlreadyReadDao.save(memberId, type);
    } catch (e) {
      if (!(e instanceof QueryFailedError)) {
        throw e;
      }
    }
  }
}
