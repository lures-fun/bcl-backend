import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  LureReviewStatus,
  ReviewStatus,
} from '~/entity/lure-review-status.entity';

@Injectable()
export class LureReviewStatusDao {
  constructor(
    @InjectRepository(LureReviewStatus)
    private lureReviewStatusRepository: Repository<LureReviewStatus>,
  ) {}

  public async selectByLureIds(ids: string[]): Promise<LureReviewStatus[]> {
    return await this.lureReviewStatusRepository.findBy({
      lureId: In(ids),
    });
  }

  public async findLatestByLureId(lureId: string): Promise<LureReviewStatus> {
    return await this.lureReviewStatusRepository.findOne({
      where: {
        lureId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  public async save(
    lureId: string,
    status: ReviewStatus,
    comment: string,
  ): Promise<void> {
    const fishingResultReviewStatus = this.lureReviewStatusRepository.create({
      lureId,
      status,
      comment,
    });
    await this.lureReviewStatusRepository.save(fishingResultReviewStatus);
  }

  public async updateReviewStatusById(
    id: string,
    status: string,
    comment: string,
  ) {
    const reviewStatus = await this.lureReviewStatusRepository.findOne({
      where: { lureId: id },
    });

    if (reviewStatus) {
      await this.lureReviewStatusRepository.update(
        { lureId: id },
        { status, comment },
      );
    } else {
      throw new NotFoundException('Lure not found!');
    }
  }
}
