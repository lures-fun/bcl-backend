import { Injectable, NotFoundException } from '@nestjs/common';
import { BlockDao } from '~/dao/block.dao';
import { MemberDao } from '~/dao/member.dao';
import { Block } from '~/entity/block.entity';

@Injectable()
export class BlockService {
  constructor(
    private readonly blockDao: BlockDao,
    private readonly memberDao: MemberDao,
  ) {}

  async block(memberId: string, blockedMemberId: string): Promise<void> {
    const existedBlock = await this.getBlockMember(memberId, blockedMemberId);
    if (existedBlock != null) {
      return;
    }
    const blockedMember = await this.memberDao.findAvailableOneById(
      blockedMemberId,
    );
    if (blockedMember == null) {
      throw new NotFoundException('Not found blocked member');
    }
    const block = new Block();
    block.blockedMemberId = blockedMemberId;
    block.memberId = memberId;
    const now = new Date();
    block.createdAt = now;
    block.blockedAt = now;
    await this.blockDao.save(block);
  }

  async unblock(memberId: string, blockedMemberId: string): Promise<void> {
    const existedBlock = await this.getBlockMember(memberId, blockedMemberId);
    if (existedBlock == null) {
      return;
    }
    await this.blockDao.delete(existedBlock.id);
  }

  async getBlockMember(
    memberId: string,
    blockedMemberId: string,
  ): Promise<Block> {
    return await this.blockDao.findOne(memberId, blockedMemberId);
  }
}
