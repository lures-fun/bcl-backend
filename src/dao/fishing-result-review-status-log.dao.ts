import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FishingResultReviewStatusLog } from '~/entity/fishing-result-review-status-log.entity';
import { ReviewStatus } from '~/entity/fishing-result-review-status.entity';

@Injectable()
export class FishingResultReviewStatusLogDao {
  constructor(
    @InjectRepository(FishingResultReviewStatusLog)
    private repository: Repository<FishingResultReviewStatusLog>,
  ) {}

  public async insert(
    fishingResultId: string,
    status: ReviewStatus,
    comment: string,
  ): Promise<void> {
    const fishingResultReviewStatusLog = this.repository.create({
      fishingResultId,
      status,
      comment,
    });
    await this.repository.insert(fishingResultReviewStatusLog);
  }

  public async selectByFishingResultId(
    fishingResultId: string,
  ): Promise<FishingResultReviewStatusLog[]> {
    return await this.repository.findBy({
      fishingResultId,
    });
  }
}
