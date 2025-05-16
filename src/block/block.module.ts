import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockDao } from '~/dao/block.dao';
import { MemberDao } from '~/dao/member.dao';
import { Block } from '~/entity/block.entity';
import { Member } from '~/entity/member.entity';
import { BlockController } from './ block.controller';
import { BlockService } from './block.service';

@Module({
  imports: [TypeOrmModule.forFeature([Block, Member])],
  providers: [BlockService, BlockDao, MemberDao],
  controllers: [BlockController],
  exports: [TypeOrmModule],
})
export class BlockModule {}
