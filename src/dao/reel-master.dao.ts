import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ReelMaster } from '~/entity/reel-master.entity';

@Injectable()
export class ReelMasterDao {
  constructor(
    @InjectRepository(ReelMaster)
    private reelMasterRepository: Repository<ReelMaster>,
  ) {}

  public async selectByEnabled(): Promise<ReelMaster[]> {
    return await this.reelMasterRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        id: 'ASC',
      },
    });
  }

  public async findById(id: string): Promise<ReelMaster> {
    return await this.reelMasterRepository.findOne({
      where: {
        id,
      },
    });
  }
}
