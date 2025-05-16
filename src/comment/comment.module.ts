import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentDao } from '~/dao/comment.dao';
import { FishingResultReviewStatusDao } from '~/dao/fishing-result-review-status.dao';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { MemberDao } from '~/dao/member.dao';
import { PostDao } from '~/dao/post.dao';
import { TokenTransactionDao } from '~/dao/token-transaction.dao';
import { Comment } from '~/entity/comment.entity';
import { FishingResultReviewStatus } from '~/entity/fishing-result-review-status.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { Member } from '~/entity/member.entity';
import { Post } from '~/entity/post.entity';
import { TokenTransaction } from '~/entity/token-transaction.entity';
import { S3Utils } from '~/util/s3.utils';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Notification } from '~/entity/notification.entity';
import { NotificationService } from '~/notification/notification.service';
import { NotificationDao } from '~/dao/notification.dao';
import { TokenExpo } from '~/entity/tokens-expo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      Comment,
      Post,
      FishingResult,
      FishingResultReviewStatus,
      TokenTransaction,
      Notification,
      TokenExpo,
    ]),
  ],
  controllers: [CommentController],
  providers: [
    MemberDao,
    CommentService,
    CommentDao,
    PostDao,
    FishingResultDao,
    FishingResultReviewStatusDao,
    TokenTransactionDao,
    S3Utils,
    NotificationService,
    NotificationDao,
  ],
  exports: [TypeOrmModule],
})
export class CommentModule {}
