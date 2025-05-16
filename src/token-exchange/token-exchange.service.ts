import { LureService } from './../lure/lure.service';
import { ConfigService } from '@nestjs/config';
import { PaginationParams, TokenExchnageDao } from '../dao/token-exchange.dao';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartItem } from '~/entity/cart-item.entity';
import { Product } from '~/entity/product.entity';
import { Order } from '~/entity/order.entity';
import {
  ExchangeTransaction,
  TransactionStatus,
} from '~/entity/exchange-transaction.entity';
import { sendCouponEmail, sendDlureEmail } from '~/util/mail.util';
import { OrderItem } from '~/entity/order-item.entity';
import { LureDao } from '~/dao/lure.dao';
import { Lure, LureType } from '~/entity/lure.entity';
import { issueDigitalLureMintId } from '~/util/mint.utils';
import { MintMaster, MintType } from '~/entity/mint-master.entity';
import { DateUtils } from '~/util/date.utils';
import { MintMasterDao } from '~/dao/mint-master.dao';
import { ReviewStatus } from '~/entity/fishing-result-review-status.entity';
import { Cart, CartStatus } from '~/entity/cart.entity';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ExchangeTransactionCoupon } from '~/entity/exchange-transaction-coupon.entity';
import { Member } from '~/entity/member.entity';
import { realTimeSendToken } from '~/solana/spl-token/real-time-token';

@Injectable()
export class TokenExchangeService {
  private readonly shopifyApiUrl: string;
  private readonly accessToken: string;

  constructor(
    private readonly tokenExchangeDao: TokenExchnageDao,
    private readonly mintMasterDao: MintMasterDao,
    private readonly configService: ConfigService,
    private readonly lureService: LureService,
    private readonly lureDao: LureDao,
  ) {
    // 環境変数から Shopify API URL とアクセストークンを取得
    this.shopifyApiUrl = this.configService.get<string>('SHOPIFY_API_DEV_URL');
    this.accessToken = this.configService.get<string>(
      'SHOPIFY_API_DEV_ACCESS_TOKEN',
    );
  }

  /* ====================================================================
     【Shopify関連処理】
     ・Price Rule の作成
     ・Discount Code の生成（単一・複数）
  ==================================================================== */

  async createPriceRule(): Promise<string> {
    try {
      const priceRuleResponse = await axios.post(
        `${this.shopifyApiUrl}price_rules.json`,
        {
          price_rule: {
            title: 'LC MTO 1.5 MSモエビシャッド 200円 OFF クーポン',
            target_type: 'line_item',
            target_selection: 'entitled',
            allocation_method: 'across',
            value_type: 'fixed_amount',
            value: '-200',
            customer_selection: 'all',
            starts_at: new Date().toISOString(),
            once_per_customer: true,
            usage_limit: 1,
            // shopifyのコレクションIDを指定
            entitled_collection_ids: [279025647681],
          },
        },
        {
          headers: {
            'X-Shopify-Access-Token': this.accessToken,
            'Content-Type': 'application/json',
          },
        },
      );

      return priceRuleResponse.data.price_rule.id;
    } catch (error) {
      if (error.response) {
        console.error(
          `Error creating price rule - Status: ${
            error.response.status
          }, Data: ${JSON.stringify(error.response.data)}`,
        );

        throw new HttpException(
          `Shopify API error: ${
            JSON.stringify(error.response.data.errors) || 'Unknown error'
          }`,
          error.response.status,
        );
      } else if (error.request) {
        console.error('No response received from Shopify API:', error.request);

        throw new HttpException(
          'No response received from Shopify API',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      } else {
        console.error('Error setting up request:', error.message);

        throw new HttpException(
          `Request setup error: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // 単一のクーポンコードを生成する関数（1件分）
  async createDiscountCode(
    productId: string,
    instanceIndex?: number,
  ): Promise<string> {
    const product = await this.tokenExchangeDao.findProductById(productId);
    const priceRuleId = product.priceRuleId;

    if (!priceRuleId) {
      throw new HttpException(
        'Price Rule ID not found for product',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      // Date.now() に加えてランダム文字列、さらに instanceIndex を付与して重複防止
      const randomStr = Math.random().toString(36).slice(2, 7);
      const indexStr = instanceIndex !== undefined ? `-${instanceIndex}` : '';
      const cleanedProductName = product.name.replace(/\s+/g, '');
      const discountCode = `BCL-${cleanedProductName}-${Date.now()}-${randomStr}${indexStr}`;
      const endpoint = `${this.shopifyApiUrl}price_rules/${priceRuleId}/discount_codes.json`;
      const response = await axios.post(
        endpoint,
        {
          discount_code: {
            code: discountCode,
          },
        },
        {
          headers: {
            'X-Shopify-Access-Token': this.accessToken,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.discount_code.code;
    } catch (error) {
      if (error.response) {
        console.error(
          `Error creating discount code - Status: ${
            error.response.status
          }, Data: ${JSON.stringify(error.response.data)}`,
        );
        throw new HttpException(
          `Shopify API error: ${
            JSON.stringify(error.response.data.errors) || 'Unknown error'
          }`,
          error.response.status,
        );
      } else if (error.request) {
        console.error('No response received from Shopify API:', error.request);
        throw new HttpException(
          'No response received from Shopify API',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      } else {
        console.error('Error setting up request:', error.message);
        throw new HttpException(
          `Request setup error: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // 複数の商品について、各商品の数量分クーポンコードを生成
  async createDiscountCodes(
    items: { productId: string; quantity: number }[],
  ): Promise<(string | null)[]> {
    const couponCodes: (string | null)[] = [];

    for (const { productId, quantity } of items) {
      for (let i = 0; i < quantity; i++) {
        try {
          const code = await this.createDiscountCode(productId, i + 1);
          couponCodes.push(code);
        } catch (error) {
          console.error(
            `Shopifyクーポン作成エラー (productId: ${productId}):`,
            error,
          );
          couponCodes.push(null);
        }
      }
    }

    return couponCodes;
  }

  /* ====================================================================
     【Cart 関連処理】
     ・カート作成、商品追加、カート取得、カート内アイテムの更新／削除
  ==================================================================== */
  async createCart(userId: string): Promise<Cart> {
    return await this.tokenExchangeDao.createCart(userId);
  }

  async getCartItems(cartId: string): Promise<CartItem[]> {
    const cart = await this.tokenExchangeDao.findCartById(cartId);
    if (!cart) {
      throw new HttpException('カートが見つかりません。', HttpStatus.NOT_FOUND);
    }
    return await this.tokenExchangeDao.findCartItemsByCartId(cartId);
  }

  async getCartByUserId(userId: string): Promise<Cart> {
    let cart = await this.tokenExchangeDao.findCartByUserId(userId);
    if (!cart) {
      cart = await this.tokenExchangeDao.createCart(userId);
    }
    return cart;
  }

  async addProductToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartItem> {
    const { productId, quantity } = addToCartDto;
    const MAX_CART_ITEM_QUANTITY = 5;

    if (quantity > MAX_CART_ITEM_QUANTITY) {
      throw new HttpException(
        `一度に追加できる商品数は${MAX_CART_ITEM_QUANTITY}個までです。`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const product = await this.tokenExchangeDao.findProductById(productId);
    if (!product) {
      throw new HttpException('商品が見つかりません。', HttpStatus.NOT_FOUND);
    }

    let cart = await this.tokenExchangeDao.findCartByUserId(userId);
    if (!cart) {
      cart = await this.tokenExchangeDao.createCart(userId);
    }

    const cartItems = await this.tokenExchangeDao.findCartItemsByCartId(
      cart.id,
    );
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    if (totalQuantity + quantity > MAX_CART_ITEM_QUANTITY) {
      throw new HttpException(
        `カート全体で追加できる商品数は${MAX_CART_ITEM_QUANTITY}個までです。`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 既に同じ商品がカートにある場合は数量を更新、なければ新規作成
    let cartItem = await this.tokenExchangeDao.findCartItem(cart.id, productId);
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = await this.tokenExchangeDao.createCartItem(
        cart,
        product,
        quantity,
      );
    }

    await this.tokenExchangeDao.saveCartItem(cartItem);
    await this.tokenExchangeDao.updateProductStock(product, quantity);

    return cartItem;
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const MAX_CART_ITEM_QUANTITY = 5;

    const cartItem = await this.tokenExchangeDao.findCartItemByIdAndUserId(
      cartItemId,
      userId,
    );
    if (!cartItem) {
      throw new NotFoundException('カートアイテムが見つかりません。');
    }

    if (updateDto.quantity !== undefined) {
      // カート内の全アイテムの合計数量をチェック（更新対象を除く）
      const cartItems = await this.tokenExchangeDao.findCartItemsByCartId(
        cartItem.cart.id,
      );

      const totalQuantityExcludingCurrent = cartItems
        .filter((item) => item.id !== cartItemId)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (
        totalQuantityExcludingCurrent + updateDto.quantity >
        MAX_CART_ITEM_QUANTITY
      ) {
        throw new HttpException(
          `カート全体で追加できる商品数は${MAX_CART_ITEM_QUANTITY}個までです。`,
          HttpStatus.BAD_REQUEST,
        );
      }

      cartItem.quantity = updateDto.quantity;
    }

    if (updateDto.status !== undefined) {
      cartItem.status = updateDto.status as CartStatus;
    }

    return await this.tokenExchangeDao.saveCartItem(cartItem);
  }

  async deleteCartItem(userId: string, cartItemId: string): Promise<void> {
    const cartItem = await this.tokenExchangeDao.findCartItemByIdAndUserId(
      cartItemId,
      userId,
    );
    if (!cartItem) {
      throw new HttpException(
        'カートアイテムが見つかりません。',
        HttpStatus.NOT_FOUND,
      );
    }

    if (cartItem.cart.userId !== userId) {
      throw new HttpException(
        'このカートアイテムへのアクセス権がありません。',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.tokenExchangeDao.deleteCartItem(cartItem);
  }

  async clearUserCart(userId: string): Promise<void> {
    await this.tokenExchangeDao.clearUserCart(userId);
  }

  /* ====================================================================
   【Product 関連処理】
   ・商品一覧取得、商品詳細取得
==================================================================== */
  async getProducts(
    page: number,
    limit: number,
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [products, total] = await this.tokenExchangeDao.findAllProducts(
      page,
      limit,
    );
    return { products, total, page, limit };
  }

  async getProductById(productId: string): Promise<Product> {
    const product = await this.tokenExchangeDao.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`商品が見つかりません: ${productId}`);
    }
    return product;
  }

  /* ====================================================================
     【Order／Transaction 関連処理】
     ・注文作成、注文アイテム作成、注文／取引の取得
  ==================================================================== */

  public async createOrder(userId: string): Promise<Order> {
    const cart = await this.tokenExchangeDao.findCartByUserId(userId);
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      throw new NotFoundException('カートに商品がありません。');
    }

    // 合計トークン計算
    let totalTokens = 0;
    for (const item of cart.cartItems) {
      totalTokens += item.product.priceInTokens * item.quantity;
    }

    // 注文オブジェクト作成（初期状態）
    let order = await this.tokenExchangeDao.createOrder(
      userId,
      totalTokens,
      TransactionStatus.PENDING,
    );

    // 注文を保存（この時点では orderItems は未設定）
    order = await this.tokenExchangeDao.saveOrder(order);

    // カート内の各商品について注文アイテムを個別に作成・保存する
    for (const item of cart.cartItems) {
      this.tokenExchangeDao.createOrderItem({
        order: order,
        product: item.product,
        quantity: item.quantity,
        tokenPrice: item.product.priceInTokens,
      });
    }

    return order;
  }

  public async getOrderById(orderId: string): Promise<Order> {
    const order = await this.tokenExchangeDao.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }
    return order;
  }

  public async createOrderItem({
    orderId,
    productId,
    quantity,
    tokenPrice,
  }: {
    orderId: string;
    productId: string;
    quantity: number;
    tokenPrice: number;
  }): Promise<OrderItem> {
    const order = await this.tokenExchangeDao.findOrderById(orderId);
    if (!order) {
      throw new Error(`Order not found for id: ${orderId}`);
    }

    const product = await this.tokenExchangeDao.findProductById(productId);
    if (!product) {
      throw new Error(`Product not found for id: ${productId}`);
    }

    const orderItem = new OrderItem({
      order,
      product,
      quantity,
      tokenPrice,
    });

    return this.tokenExchangeDao.saveOrderItem(orderItem);
  }

  public async getTransactionById(
    transactionId: string,
  ): Promise<ExchangeTransaction> {
    const transaction = await this.tokenExchangeDao.findTransactionById(
      transactionId,
    );
    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found.`,
      );
    }
    return transaction;
  }

  public async getTransactionsByUserId(
    userId: string,
  ): Promise<ExchangeTransaction[]> {
    return await this.tokenExchangeDao.findTransactionsByUserId(userId);
  }

  // 注文履歴を取得し、フロントエンド用に変換（ページング対応）
  async findOrdersByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<any> {
    // ページング付きで注文データを取得
    const { data: rawOrders, meta } =
      await this.tokenExchangeDao.findOrdersByUserId(userId, pagination);

    // フロントエンド用に変換
    const orders = rawOrders.map((order) => {
      // 注文アイテムの変換
      const items = order.orderItems.map((item) => ({
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        imageUrl: item.product.imageUrl,
        quantity: item.quantity,
        priceInTokens: Number(item.tokenPrice),
      }));

      const solanaTransactionId =
        order.transactions.length > 0
          ? order.transactions[0].solanaTransactionId
          : undefined;

      // クーポンの抽出とフラット化
      const coupons = [];

      // 各トランザクションのクーポンを処理
      order.transactions.forEach((transaction) => {
        transaction.coupons.forEach((coupon) => {
          // どの注文アイテムに対応するクーポンか特定
          const relatedItem = order.orderItems.find(
            (item) =>
              item.product.name ===
                this.extractProductNameFromCoupon(coupon.couponCode) ||
              coupon.couponCode.includes(item.product.name),
          );
          coupons.push({
            id: coupon.id,
            code: coupon.couponCode,
            description: relatedItem
              ? relatedItem.product.name
              : this.getCouponDescription(order, coupon.couponCode),
            isUsed: coupon.markedAsUsed,
            orderId: order.id,
          });
        });
      });

      return {
        id: order.id,
        orderDate: order.createdAt,
        totalTokens: Number(order.totalTokens),
        items,
        transactionId: solanaTransactionId,
        coupons,
      };
    });

    return {
      orders,
      pagination: {
        totalItems: meta.total,
        currentPage: meta.page,
        itemsPerPage: meta.limit,
        totalPages: meta.totalPages,
      },
    };
  }

  // クーポンコードから商品名を抽出
  private extractProductNameFromCoupon(couponCode: string): string {
    // クーポンコードのフォーマットによって適切な抽出ロジックを実装
    // 例: "BCL-ベローズギル100円OFF-1740926171110-m46vc-1" → "ベローズギル"
    const match = couponCode.match(/BCL-(.+?)(?:OFF|-\d+)/i);
    return match ? match[1] : '';
  }

  // クーポンの説明を取得（製品名やクーポン情報から）
  private getCouponDescription(order: any, couponCode: string): string {
    // 関連する商品名を探す
    const matchingProduct = order.orderItems.find(
      (item) =>
        item.product.name.includes('OFF') ||
        item.product.description.includes('OFF'),
    );

    return matchingProduct ? matchingProduct.product.name : 'クーポン';
  }

  async updateCouponUsage(
    couponId: string,
    userId: string,
    isUsed: boolean,
  ): Promise<void> {
    // 所有権の検証
    await this.validateCouponOwnership(couponId, userId);

    // クーポンの使用状態を更新
    await this.tokenExchangeDao.updateCouponUsageStatus(couponId, isUsed);
  }

  async checkCouponUsage(couponId: string, userId: string): Promise<boolean> {
    // 所有権の検証
    await this.validateCouponOwnership(couponId, userId);

    // クーポンの使用状態を取得
    const coupon = await this.tokenExchangeDao.findCouponById(couponId);
    return coupon.markedAsUsed;
  }

  async validateCouponOwnership(
    couponId: string,
    userId: string,
  ): Promise<void> {
    const coupon = await this.tokenExchangeDao.findCouponById(couponId);
    const transaction = await this.tokenExchangeDao.findTransactionById(
      coupon.transaction.id,
    );

    if (transaction.userId !== userId) {
      throw new ForbiddenException('このクーポンへのアクセス権がありません');
    }
  }

  async initializeTransaction(data: {
    userId: string;
    orderId: string;
    tokenAmount: number;
    status: TransactionStatus;
    solanaTransactionId?: string;
  }): Promise<string> {
    const order = await this.getOrderById(data.orderId);
    if (!order) {
      throw new Error(`Order with ID ${data.orderId} not found`);
    }

    const transactionData = {
      ...data,
      order,
    };

    const transaction =
      this.tokenExchangeDao.createTransaction(transactionData);
    const savedTransaction = await this.tokenExchangeDao.saveTransaction(
      transaction,
    );

    return savedTransaction.id;
  }

  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    solanaTransactionId?: string,
  ): Promise<void> {
    await this.tokenExchangeDao.updateTransactionStatus(
      transactionId,
      status,
      solanaTransactionId,
    );
  }

  async createShopifyDiscount(productId): Promise<string | null> {
    try {
      const couponCode = await this.createDiscountCode(productId);
      return couponCode;
    } catch (error) {
      console.error('Shopifyクーポン作成エラー:', error);
      return null;
    }
  }

  async createShopifyDiscountMultiple(
    productIds: string[],
  ): Promise<(string | null)[]> {
    const couponCodes: (string | null)[] = [];
    for (const productId of productIds) {
      try {
        const code = await this.createDiscountCode(productId);
        couponCodes.push(code);
      } catch (error) {
        console.error(
          `Shopifyクーポン作成エラー (productId: ${productId}):`,
          error,
        );
        couponCodes.push(null);
      }
    }
    return couponCodes;
  }
  /* ====================================================================
     【メール送信関連処理】
  ==================================================================== */
  async sendCouponEmail(
    username: string,
    email: string,
    tokenAmount: number,
    couponCode: string,
  ): Promise<{ success: boolean }> {
    try {
      await sendCouponEmail(email, username, tokenAmount, couponCode);

      return { success: true };
    } catch (error) {
      console.error('メール送信エラー:', error);
      return { success: false };
    }
  }

  async sendDigitalLureEmail(
    username: string,
    email: string,
    tokenAmount: number,
  ): Promise<{ success: boolean }> {
    try {
      await sendDlureEmail(email, username, tokenAmount);

      return { success: true };
    } catch (error) {
      console.error('メール送信エラー:', error);
      return { success: false };
    }
  }

  /* ====================================================================
     【デジタルルアー購入関連処理】
  ==================================================================== */
  async buyDigitalLure(userId: string, productId: string): Promise<void> {
    try {
      const product = await this.getProductById(productId);

      const lureId = await this.lureDao.insert(
        new Lure({
          memberId: userId,
          imagePathForApply: product.imageUrl,
          imagePathForNft: product.imageUrl,
          purchasedAt: new Date(),
          color: 'Mosaic',
          serialCode: `MOSAIC_LURE/000`,
          lureType: LureType.MOSAIC_LURE,
        }),
      );
      const mintId = await issueDigitalLureMintId();

      await this.lureDao.updateMintIdById(lureId, mintId);
      await this.mintMasterDao.insert(
        new MintMaster({
          id: mintId,
          type: MintType.LURE,
          contentId: lureId,
        }),
      );

      this.lureService.saveReviewStatus(
        lureId,
        ReviewStatus.APPROVE,
        `${DateUtils.formatDate(
          new Date(),
        )} にデジタルルアーが登録されました。`,
      );
    } catch (error) {
      console.error('デジタルルアー購入エラー:', error);
      throw new HttpException(
        'デジタルルアー購入エラー',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async exchangeTransactionCouponInsert(
    data,
  ): Promise<ExchangeTransactionCoupon> {
    return await this.tokenExchangeDao.exchangeTransactionCouponInsert(data);
  }

  /* ====================================================================
     【Checkout／トークン交換処理】
     ・カート内商品のチェックアウト処理
     ・Shopify クーポン生成、取引テーブル更新、メール送信
  ==================================================================== */
  async checkoutForCart(
    user: Member,
    checkoutData,
  ): Promise<{ totalTokens: number }> {
    const { orderId, solanaTransactionId, offlineTransaction } = checkoutData;
    const { email, userName, id: userId } = user;

    // ① ユーザーのカート取得
    const cart = await this.getCartByUserId(userId);
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      throw new HttpException(
        'カートに商品がありません。',
        HttpStatus.BAD_REQUEST,
      );
    }

    // ② 合計トークン数の計算
    let totalTokenAmount = 0;
    for (const item of cart.cartItems) {
      totalTokenAmount += item.product.priceInTokens * item.quantity;
    }

    // ③ トランザクションの初期化
    const transactionId = await this.initializeTransaction({
      userId,
      orderId,
      tokenAmount: totalTokenAmount,
      status: TransactionStatus.PENDING,
      solanaTransactionId: solanaTransactionId,
    });

    await this.updateTransactionStatus(
      transactionId,
      TransactionStatus.IN_PROGRESS,
    );

    // ④ カート内全商品の注文アイテム作成
    for (const item of cart.cartItems) {
      await this.createOrderItem({
        orderId,
        productId: item.product.id,
        quantity: item.quantity,
        tokenPrice: item.product.priceInTokens,
      });
    }

    // ⑤ Shopifyクーポン生成（クーポン対象商品だけ）
    const discountItems = cart.cartItems
      .filter((item) => item.product.priceRuleId)
      .map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

    const couponCodes =
      discountItems.length > 0
        ? await this.createDiscountCodes(discountItems)
        : [];

    if (couponCodes.some((code) => code === null)) {
      await this.updateTransactionStatus(
        transactionId,
        TransactionStatus.FAILED_SHOPIFY_COUPON,
      );
      throw new HttpException(
        'Shopifyクーポンの作成に失敗しました。時間をおいて再度お試しください',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sendTokenResult = await realTimeSendToken({
      transaction: offlineTransaction,
      feePayerSecret: this.configService.get<string>('SYSTEM_WALLET_SECRET'),
      rpcUrl: this.configService.get<string>('SOLANA_RPC_URL'),
    });

    // ⑥ 新しく ExchangeTransactionCoupon テーブルに各クーポンを挿入
    for (const code of couponCodes) {
      await this.exchangeTransactionCouponInsert({
        transaction: transactionId,
        couponCode: code,
      });
    }

    // ⑦ クーポンメールの送信（複数のクーポンコードをまとめて送信）
    const emailResult = await this.sendCouponEmail(
      userName,
      email,
      totalTokenAmount,
      couponCodes.join(','),
    );
    if (!emailResult.success) {
      await this.updateTransactionStatus(
        transactionId,
        TransactionStatus.FAILED_EMAIL,
        sendTokenResult.message,
      );
      throw new HttpException(
        'クーポンメールの送信に失敗しました。お問い合わせください。',
        HttpStatus.BAD_REQUEST,
      );
    }

    // ⑧ トランザクション状態の更新とカートのクリア
    await this.updateTransactionStatus(
      transactionId,
      TransactionStatus.COMPLETED,
      sendTokenResult.message,
    );

    // 注文ステータスも COMPLETED に更新
    await this.tokenExchangeDao.updateOrderStatus(
      orderId,
      TransactionStatus.COMPLETED,
    );

    await this.clearUserCart(userId);

    return {
      totalTokens: totalTokenAmount,
    };
  }
}
