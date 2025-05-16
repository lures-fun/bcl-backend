import { Module } from '@nestjs/common';
import { TokenExchangeService } from './token-exchange.service';
import { TokenExchangeController } from './token-exchange.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '~/entity/cart.entity';
import { TokenExchnageDao } from '~/dao/token-exchange.dao';
import { CartItem } from '~/entity/cart-item.entity';
import { Product } from '~/entity/product.entity';
import { Order } from '~/entity/order.entity';
import { ExchangeTransaction } from '~/entity/exchange-transaction.entity';
import { OrderItem } from '~/entity/order-item.entity';
import { MintMasterDao } from '~/dao/mint-master.dao';
import { LureService } from '~/lure/lure.service';
import { LureDao } from '~/dao/lure.dao';
import { MintMaster } from '~/entity/mint-master.entity';
import { LureReviewStatusDao } from '~/dao/lure-review-status.dao';
import { LureReviewStatusLogDao } from '~/dao/lure-review-status-log.dao';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { Trophy } from '~/entity/trophy.entity';
import { TrophyDao } from '~/dao/trophy.dao';
import { LureImageMasterDao } from '~/dao/lure-image-master.dao';
import { OneTimeTokenDao } from '~/dao/one-time-token.dao';
import { ShopifyProductsDao } from '~/dao/shopify-products.dao';
import { S3Utils } from '~/util/s3.utils';
import { Lure } from '~/entity/lure.entity';
import { LureReviewStatus } from '~/entity/lure-review-status.entity';
import { LureReviewStatusLog } from '~/entity/lure-review-status-log.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { LureImageMaster } from '~/entity/lure-image-master.entity';
import { OneTimeToken } from '~/entity/one-time-token';
import { ShopifyProducts } from '~/entity/shopify-products.entity';
import { ExchangeTransactionCoupon } from '~/entity/exchange-transaction-coupon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Product,
      Order,
      OrderItem,
      ExchangeTransaction,
      MintMaster,
      Lure,
      LureReviewStatus,
      LureReviewStatusLog,
      FishingResult,
      Trophy,
      LureImageMaster,
      OneTimeToken,
      ShopifyProducts,
      ExchangeTransactionCoupon,
    ]),
  ],
  providers: [
    TokenExchangeService,
    TokenExchnageDao,
    MintMasterDao,
    LureService,
    LureDao,
    LureReviewStatusDao,
    LureReviewStatusLogDao,
    FishingResultDao,
    TrophyDao,
    LureImageMasterDao,
    OneTimeTokenDao,
    ShopifyProductsDao,
    S3Utils,
  ],
  controllers: [TokenExchangeController],
})
export class TokenExchangeModule {}
