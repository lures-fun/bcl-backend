import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { TrophyTypeMaster } from '~/entity/trophy-type-master.entity';
import { TrophyType } from '~/entity/trophy.entity';

@Injectable()
export class TrophyTypeMasterDao {
  constructor(
    @InjectRepository(TrophyTypeMaster)
    private trophyTypeMasterDao: Repository<TrophyTypeMaster>,
  ) {}

  public async selectByEnabled(): Promise<TrophyTypeMaster[]> {
    return await this.trophyTypeMasterDao.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        id: 'ASC',
      },
    });
  }

  public async findByType(type: TrophyType): Promise<TrophyTypeMaster> {
    return await this.trophyTypeMasterDao.findOne({
      where: {
        type,
      },
    });
  }
}
