import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { MintMaster } from '~/entity/mint-master.entity';

@Injectable()
export class MintMasterDao {
  constructor(
    @InjectRepository(MintMaster)
    private mintMasterRepository: Repository<MintMaster>,
  ) {}

  public async insert(entity: MintMaster) {
    await this.mintMasterRepository.insert(entity);
  }

  public async findById(id: string): Promise<MintMaster> {
    return await this.mintMasterRepository.findOne({
      where: {
        id,
      },
    });
  }

  public async update(entity: MintMaster) {
    await this.mintMasterRepository.save(entity);
  }

  public async delete(id: string): Promise<DeleteResult> {
    return await this.mintMasterRepository.delete({ id });
  }
}
