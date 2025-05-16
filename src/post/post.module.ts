import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostDao } from '~/dao/post.dao';
import { Post } from '~/entity/post.entity';
import { Member } from '~/entity/member.entity';
import { TokenMaster } from '~/entity/token-master.entity';
import { TokenTransaction } from '~/entity/token-transaction.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MemberDao } from '~/dao/member.dao';
import { TokenMasterDao } from '~/dao/token-master.dao';
import { TokenTransactionDao } from '~/dao/token-transaction.dao';
import { CryptUtils } from '~/util/crypt.utils';
import { TokenUtils } from '~/util/token.utils';
import { NotificationService } from '~/notification/notification.service';
import { NotificationDao } from '~/dao/notification.dao';
import { Notification } from '~/entity/notification.entity';
import { TokenExpo } from '~/entity/tokens-expo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      Member,
      TokenMaster,
      TokenTransaction,
      Notification,
      TokenExpo,
    ]),
  ],
  controllers: [PostController],
  providers: [
    PostService,
    PostDao,
    MemberDao,
    TokenMasterDao,
    TokenTransactionDao,
    CryptUtils,
    TokenUtils,
    NotificationService,
    NotificationDao,
  ],
  exports: [TypeOrmModule],
})
export class PostModule {}
