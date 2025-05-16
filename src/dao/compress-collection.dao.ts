import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompressCollection } from './../entity/compress-collection.entity';

@Injectable()
export class CompressCollectionDao {
  constructor(
    @InjectRepository(CompressCollection)
    private CompressCollectionRepository: Repository<CompressCollection>,
  ) {}

  public async findTreeOwner(
    collectionType: string,
  ): Promise<CompressCollection> {
    return await this.CompressCollectionRepository.findOne({
      where: {
        collectionType,
      },
    });
  }

  public async findBatchStatus(
    isMintbatchEnabled: boolean,
  ): Promise<CompressCollection[]> {
    return await this.CompressCollectionRepository.find({
      where: {
        isMintbatchEnabled,
      },
    });
  }
}
