import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { GoodDao } from '~/dao/good.dao';
import { PostDao } from '~/dao/post.dao';
import { FishingResult } from '~/entity/fishing-result.entity';
import { Good } from '~/entity/good.entity';
import { Post } from '~/entity/post.entity';
import { GoodController } from './good.controller';
import { GoodService } from './good.service';
import { MemberDao } from '~/dao/member.dao';
import { NotificationDao } from '~/dao/notification.dao';
import { Member } from '~/entity/member.entity';
import { Notification } from '~/entity/notification.entity';
import { NotificationService } from '~/notification/notification.service';
import { TokenExpo } from '~/entity/tokens-expo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Good,
      FishingResult,
      Post,
      Member,
      Notification,
      TokenExpo,
    ]),
  ],
  controllers: [GoodController],
  providers: [
    GoodService,
    GoodDao,
    FishingResultDao,
    PostDao,
    MemberDao,
    NotificationService,
    NotificationDao,
  ],
  exports: [TypeOrmModule],
})
export class GoodModule {}
