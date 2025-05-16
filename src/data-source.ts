import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Block } from './entity/block.entity';
import { Comment } from './entity/comment.entity';
import { Contest } from './entity/contest.entity';
import { FieldMaster } from './entity/field-master.entity';
import { FishingResultReviewStatusLog } from './entity/fishing-result-review-status-log.entity';
import { FishingResultReviewStatus } from './entity/fishing-result-review-status.entity';
import { FishingResult } from './entity/fishing-result.entity';
import { Follow } from './entity/follow.entity';
import { Good } from './entity/good.entity';
import { LineMaster } from './entity/line-master.entity';
import { LureImageMaster } from './entity/lure-image-master.entity';
import { LureReviewStatusLog } from './entity/lure-review-status-log.entity';
import { LureReviewStatus } from './entity/lure-review-status.entity';
import { Lure } from './entity/lure.entity';
import { Member } from './entity/member.entity';
import { Merchandise } from './entity/merchandise.entity';
import { MintMaster } from './entity/mint-master.entity';
import { News } from './entity/news.entity';
import { Post } from './entity/post.entity';
import { ReelMaster } from './entity/reel-master.entity';
import { Report } from './entity/report.entity';
import { RodMaster } from './entity/rod-master.entity';
import { TimelineAlreadyRead } from './entity/timeline-already-read.entity';
import { TokenTransaction } from './entity/token-transaction.entity';
import { Topic } from './entity/topic.entity';
import { TrophyTypeMaster } from './entity/trophy-type-master.entity';
import { Trophy } from './entity/trophy.entity';
import { CompressCollection } from './entity/compress-collection.entity';
import { OneTimeToken } from './entity/one-time-token';
import { ShopifyProducts } from './entity/shopify-products.entity';
import { Cart } from './entity/cart.entity';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { CartItem } from './entity/cart-item.entity';
import { Product } from './entity/product.entity';
import { TokenMaster } from './entity/token-master.entity';
import { ExchangeTransaction } from './entity/exchange-transaction.entity';
import { Notification } from './entity/notification.entity';
import { TokenExpo } from './entity/tokens-expo.entity';
import { ExchangeTransactionCoupon } from './entity/exchange-transaction-coupon.entity';

dotenv.config();
const env = process.env;
if (!env.NODE_ENV) {
  throw new Error('環境指定がされていません');
}
dotenv.config({ path: `.env.${env.NODE_ENV}` });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: env.DB_HOST || 'localhost',
  port: parseInt(env.DB_PORT) || 3306,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  synchronize: false,
  logging: true,
  logger: 'simple-console', // note: simple-console | file
  entities: [
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
  migrations: ['src/migration/*.ts'],
});

AppDataSource.initialize()
  .then(() => {
    console.log('env', env.NODE_ENV);
    console.log('DB_USERNAME', env.DB_USERNAME);
    console.log('host', env.DB_HOST);
    console.log('JWT_SECRET', env.JWT_SECRET);
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
