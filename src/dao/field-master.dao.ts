import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { FieldMaster } from '~/entity/field-master.entity';

@Injectable()
export class FieldMasterDao {
  constructor(
    @InjectRepository(FieldMaster)
    private fieldMasterRepository: Repository<FieldMaster>,
  ) {}

  public async selectByEnabled(): Promise<FieldMaster[]> {
    return await this.fieldMasterRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        id: 'ASC',
      },
    });
  }

  public async findById(id: string): Promise<FieldMaster> {
    return await this.fieldMasterRepository.findOne({
      where: {
        id,
      },
    });
  }
}
