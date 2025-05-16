import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { AdminContestModel } from '~/admin-contest/model/admin-contest.model';
import { Contest } from '~/entity/contest.entity';

@Injectable()
export class ContestDao {
  constructor(
    @InjectRepository(Contest) private contestRepository: Repository<Contest>,
  ) {}

  public async create(
    model: AdminContestModel,
    imagePath: string,
  ): Promise<Contest> {
    return await this.contestRepository.create({
      ...model,
      imagePath: imagePath,
    });
  }

  public async save(contest: Contest): Promise<Contest> {
    return await this.contestRepository.save(contest);
  }

  public async delete(id: string): Promise<DeleteResult> {
    return await this.contestRepository.delete({ id });
  }

  public async findAll(): Promise<Contest[]> {
    return await this.contestRepository.find({
      order: {
        willBeStartAt: 'DESC',
      },
    });
  }

  public async findOneById(id: string): Promise<Contest> {
    return await this.contestRepository.findOne({
      where: { id },
    });
  }
}
