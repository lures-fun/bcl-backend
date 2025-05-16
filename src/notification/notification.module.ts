import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '~/entity/notification.entity';
import { NotificationDao } from '~/dao/notification.dao';
import { NotificationService } from './notification.service';
import { TokenExpo } from '~/entity/tokens-expo.entity';
import { Member } from '~/entity/member.entity';
import { NotificationController } from './notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, TokenExpo, Member])],
  providers: [NotificationService, NotificationDao],
  controllers: [NotificationController],
  exports: [NotificationService, NotificationDao],
})
export class NotificationModule {}
