import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import 'reflect-metadata';
import { Contest } from '~/entity/contest.entity';
import { FishingResultReviewStatus } from '~/entity/fishing-result-review-status.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { Follow } from '~/entity/follow.entity';
import { LureReviewStatus } from '~/entity/lure-review-status.entity';
import { Lure } from '~/entity/lure.entity';
import { Member } from '~/entity/member.entity';
import { MintMaster } from '~/entity/mint-master.entity';
import { News } from '~/entity/news.entity';
import { Topic } from '~/entity/topic.entity';
import { Trophy } from '~/entity/trophy.entity';
import { Block } from './entity/block.entity';
import { Comment } from './entity/comment.entity';
import { CompressCollection } from './entity/compress-collection.entity';
import { FieldMaster } from './entity/field-master.entity';
import { FishingResultReviewStatusLog } from './entity/fishing-result-review-status-log.entity';
import { Good } from './entity/good.entity';
import { LineMaster } from './entity/line-master.entity';
import { LureImageMaster } from './entity/lure-image-master.entity';
import { LureReviewStatusLog } from './entity/lure-review-status-log.entity';
import { Merchandise } from './entity/merchandise.entity';
import { OneTimeToken } from './entity/one-time-token';
import { Post } from './entity/post.entity';
import { ReelMaster } from './entity/reel-master.entity';
import { Report } from './entity/report.entity';
import { RodMaster } from './entity/rod-master.entity';
import { TimelineAlreadyRead } from './entity/timeline-already-read.entity';
import { TokenMaster } from './entity/token-master.entity';
import { TokenTransaction } from './entity/token-transaction.entity';
import { TrophyTypeMaster } from './entity/trophy-type-master.entity';
import { ShopifyProducts } from './entity/shopify-products.entity';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { Product } from './entity/product.entity';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { ExchangeTransaction } from './entity/exchange-transaction.entity';
import { Notification } from './entity/notification.entity';
import { TokenExpo } from './entity/tokens-expo.entity';
import { ExchangeTransactionCoupon } from './entity/exchange-transaction-coupon.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const configService = new ConfigService();
    return {
      type: 'mysql',
      host: configService.get('DB_HOST'),
      port: parseInt(configService.get('DB_PORT'), 10),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_DATABASE'),
      synchronize: false,
      logging: configService.get<boolean>('DB_LOGGING', false),
      entities: [
        // '~/entity/**/*.ts' // It cases "SyntaxError: Cannot use import statement outside a module"
        Contest,
        FishingResultReviewStatus,
        FishingResultReviewStatusLog,
        FishingResult,
        Follow,
        LureReviewStatus,
        LureReviewStatusLog,
        Lure,
        Trophy,
        Member,
        MintMaster,
        News,
        Topic,
        TimelineAlreadyRead,
        FieldMaster,
        RodMaster,
        ReelMaster,
        LineMaster,
        LureImageMaster,
        Post,
        Comment,
        TokenTransaction,
        Good,
        Merchandise,
        TrophyTypeMaster,
        CompressCollection,
        OneTimeToken,
        ShopifyProducts,
        Cart,
        CartItem,
        Product,
        Order,
        OrderItem,
        ExchangeTransaction,
        TokenMaster,
        Notification,
        TokenExpo,
        Block,
        Report,
        ExchangeTransactionCoupon,
      ],
    };
  }
}
