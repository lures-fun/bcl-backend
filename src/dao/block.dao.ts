import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Repository } from 'typeorm';
import { Block } from '~/entity/block.entity';

@Injectable()
export class BlockDao {
  constructor(
    @InjectRepository(Block) private blockRepository: Repository<Block>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  public async save(Block: Block): Promise<Block> {
    return await this.blockRepository.save(Block);
  }

  public async delete(id: string): Promise<DeleteResult> {
    return await this.blockRepository.delete({ id });
  }

  public async findOne(
    memberId: string,
    blockedMemberId: string,
  ): Promise<Block> {
    return await this.blockRepository.findOne({
      where: {
        memberId: memberId,
        blockedMemberId: blockedMemberId,
      },
    });
  }
}
