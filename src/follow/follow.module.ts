import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { Follow } from '~/entity/follow.entity';
import { Member } from '~/entity/member.entity';
import { FollowDao } from '~/dao/follow.dao';
import { MemberDao } from '~/dao/member.dao';
import { NotificationModule } from '~/notification/notification.module';
@Module({
  imports: [TypeOrmModule.forFeature([Follow, Member]), NotificationModule],
  providers: [FollowService, FollowDao, MemberDao],
  controllers: [FollowController],
  exports: [TypeOrmModule],
})
export class FollowModule {}
