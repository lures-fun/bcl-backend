import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FishingResultReviewStatus,
  ReviewStatus,
} from '~/entity/fishing-result-review-status.entity';

@Injectable()
export class FishingResultReviewStatusDao {
  constructor(
    @InjectRepository(FishingResultReviewStatus)
    private fishingResultReviewStatusRepository: Repository<FishingResultReviewStatus>,
  ) {}

  public async findLatestByFishingResultId(
    fishingResultId: string,
  ): Promise<FishingResultReviewStatus> {
    return await this.fishingResultReviewStatusRepository.findOne({
      where: {
        fishingResultId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  public async save(
    fishingResultId: string,
    status: ReviewStatus,
    comment: string,
  ): Promise<void> {
    const fishingResultReviewStatus =
      this.fishingResultReviewStatusRepository.create({
        fishingResultId,
        status,
        comment,
      });
    await this.fishingResultReviewStatusRepository.save(
      fishingResultReviewStatus,
    );
  }

  public async adminFishingResultUpdateById(
    id: string,
    status: string,
    comment: string,
  ): Promise<void> {
    const fishingResultReviewStatus =
      await this.fishingResultReviewStatusRepository.findOne({
        where: {
          fishingResultId: id,
        },
      });
    if (fishingResultReviewStatus) {
      await this.fishingResultReviewStatusRepository.update(
        { fishingResultId: id },
        { status, comment },
      );
    } else {
      throw new NotFoundException('Fishing result not found!');
    }
  }
}
