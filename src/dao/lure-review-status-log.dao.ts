import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LureReviewStatusLog } from '~/entity/lure-review-status-log.entity';
import { ReviewStatus } from '~/entity/lure-review-status.entity';

@Injectable()
export class LureReviewStatusLogDao {
  constructor(
    @InjectRepository(LureReviewStatusLog)
    private repository: Repository<LureReviewStatusLog>,
  ) {}

  public async insert(
    lureId: string,
    status: ReviewStatus,
    comment: string,
  ): Promise<void> {
    const lureReviewStatusLog = this.repository.create({
      lureId,
      status,
      comment,
    });
    await this.repository.insert(lureReviewStatusLog);
  }

  public async selectByLureId(lureId: string): Promise<LureReviewStatusLog[]> {
    return await this.repository.findBy({
      lureId,
    });
  }
}
