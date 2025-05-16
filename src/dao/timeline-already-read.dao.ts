import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TimelineAlreadyRead,
  Type,
} from '~/entity/timeline-already-read.entity';

@Injectable()
export class TimelineAlreadyReadDao {
  constructor(
    @InjectRepository(TimelineAlreadyRead)
    private timelineAlreadyReadRepository: Repository<TimelineAlreadyRead>,
  ) {}

  public async save(memberId: string, type: Type): Promise<void> {
    // ON UPDATE を実行させたいのでsaveは使わない
    if (
      !(await this.timelineAlreadyReadRepository.findOne({
        where: { memberId, type },
      }))
    ) {
      await this.timelineAlreadyReadRepository.insert(
        this.timelineAlreadyReadRepository.create({
          memberId,
          type,
        }),
      );
    } else {
      await this.timelineAlreadyReadRepository.update(
        { memberId, type },
        { memberId, type },
      );
    }
  }

  public async findByMemberId(
    memberId: string,
    type: Type,
  ): Promise<TimelineAlreadyRead> {
    return await this.timelineAlreadyReadRepository.findOne({
      where: {
        memberId,
        type,
      },
    });
  }
}
