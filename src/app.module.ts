import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminContestModule } from './admin-contest/admin-contest.module';
import { AdminFishingResultsModule } from './admin-fishing-results/admin-fishing-results.module';
import { AdminLureModule } from './admin-lures/admin-lure.module';
import { AdminMerchandiseModule } from './admin-merchandise/admin-merchandise.module';
import { AdminNewsModule } from './admin-news/admin-news.module';
import { AdminTrophyModule } from './admin-trophy/admin-trophy.module';
import { AdminUserModule } from './admin-user/admin-user.module';
import { AuthModule } from './auth/auth.module';
import { BatchModule } from './batch/batch.module';
import { BlockModule } from './block/block.module';
import { CommentModule } from './comment/comment.module';
import { ContestModule } from './contest/contest.module';
import { FishingResultModule } from './fishing-result/fishing-result.module';
import { FollowModule } from './follow/follow.module';
import { GalleryModule } from './gallery/gallery.module';
import { GoodModule } from './good/good.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { LureModule } from './lure/lure.module';
import { MasterModule } from './master/master.module';
import { MerchandiseModule } from './merchandise/merchandise.module';
import { CsrfMiddleware } from './middleware/csrf.middleware';
import { XContentTypeOptionsMiddleware } from './middleware/x-content-type-options.middleware';
import { XFrameOptionsMiddleware } from './middleware/x-frame-options.middleware';
import { XXSSProtectionMiddleware } from './middleware/x-xss-protection.middleware';
import { PostModule } from './post/post.module';
import { RankingModule } from './ranking/ranking.module';
import { ReportModule } from './report/report.module';
import { S3Module } from './s3/s3.module';
import { SearchModule } from './search/search.module';
import { TackleBoxModule } from './tackle-box/tackle-box.module';
import { TimelineModule } from './timeline/timeline.module';
import { TranslateModule } from './translate/translate.module';
import { TrophyModule } from './trophy/trophy.module';
import { TypeOrmConfigService } from './type-orm-config.service';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenExchangeModule } from './token-exchange/token-exchange.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    ScheduleModule.forRoot(),
    ContestModule,
    TackleBoxModule,
    LureModule,
    UserModule,
    FishingResultModule,
    FollowModule,
    GalleryModule,
    AuthModule,
    AdminLureModule,
    AdminUserModule,
    AdminContestModule,
    AdminNewsModule,
    MasterModule,
    AdminFishingResultsModule,
    HealthCheckModule,
    CommentModule,
    PostModule,
    TimelineModule,
    AdminTrophyModule,
    TrophyModule,
    GoodModule,
    SearchModule,
    MerchandiseModule,
    AdminMerchandiseModule,
    RankingModule,
    S3Module,
    BatchModule,
    TokenExchangeModule,
    TranslateModule,
    NotificationModule,
    BlockModule,
    ReportModule,
  ],
})
export class AppModule {
  // TODO 全APIに適用するように設定
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CsrfMiddleware)
      .forRoutes({ path: '/logout', method: RequestMethod.ALL });
    consumer.apply(XFrameOptionsMiddleware).forRoutes('*');
    consumer.apply(XXSSProtectionMiddleware).forRoutes('*');
    consumer.apply(XContentTypeOptionsMiddleware).forRoutes('*');
  }
}
