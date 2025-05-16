import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { LineMaster } from '~/entity/line-master.entity';

@Injectable()
export class LineMasterDao {
  constructor(
    @InjectRepository(LineMaster)
    private lineMasterRepository: Repository<LineMaster>,
  ) {}

  public async selectByEnabled(): Promise<LineMaster[]> {
    return await this.lineMasterRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        id: 'ASC',
      },
    });
  }

  public async findById(id: string): Promise<LineMaster> {
    return await this.lineMasterRepository.findOne({
      where: {
        id,
      },
    });
  }
}
