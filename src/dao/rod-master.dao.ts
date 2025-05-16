import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RodMaster } from '~/entity/rod-master.entity';

@Injectable()
export class RodMasterDao {
  constructor(
    @InjectRepository(RodMaster)
    private rodMasterRepository: Repository<RodMaster>,
  ) {}

  public async selectByEnabled(): Promise<RodMaster[]> {
    return await this.rodMasterRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        id: 'ASC',
      },
    });
  }

  public async findById(id: string): Promise<RodMaster> {
    return await this.rodMasterRepository.findOne({
      where: {
        id,
      },
    });
  }
}
