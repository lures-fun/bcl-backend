import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '~/entity/member.entity';
import { S3Utils } from '~/util/s3.utils';
import { MemberDao } from '../dao/member.dao';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TokenMaster } from '~/entity/token-master.entity';
import { TokenTransaction } from '~/entity/token-transaction.entity';
import { TokenMasterDao } from '~/dao/token-master.dao';
import { TokenTransactionDao } from '~/dao/token-transaction.dao';
import { CryptUtils } from '~/util/crypt.utils';
import { TokenUtils } from '~/util/token.utils';
import { Notification } from '~/entity/notification.entity';
import { TokenExpo } from '~/entity/tokens-expo.entity';
import { NotificationService } from '~/notification/notification.service';
import { NotificationDao } from '~/dao/notification.dao';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      TokenMaster,
      TokenTransaction,
      Notification,
      TokenExpo,
    ]),
  ],
  providers: [
    UserService,
    MemberDao,
    S3Utils,
    TokenMasterDao,
    TokenTransactionDao,
    CryptUtils,
    TokenUtils,
    NotificationService,
    NotificationDao,
  ],
  controllers: [UserController],
  exports: [TypeOrmModule],
})
export class UserModule {}
