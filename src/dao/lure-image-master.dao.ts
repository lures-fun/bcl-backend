import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LureImageMaster } from '~/entity/lure-image-master.entity';
import { LureType } from '~/entity/lure.entity';

@Injectable()
export class LureImageMasterDao {
  constructor(
    @InjectRepository(LureImageMaster)
    private lureImageMasterRepository: Repository<LureImageMaster>,
  ) {}

  public async findBySerialCodeAndLureTypeAndLevel(
    serialCode: string,
    lureType: LureType,
    level: number,
  ): Promise<LureImageMaster> {
    return await this.lureImageMasterRepository.findOne({
      where: {
        serialCode,
        lureType,
        level,
      },
    });
  }
}
