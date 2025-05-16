import { ExchangeTransactionCoupon } from './../entity/exchange-transaction-coupon.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, CartStatus } from '~/entity/cart.entity';
import { CartItem } from '~/entity/cart-item.entity';
import { Product } from '~/entity/product.entity';
import { Order } from '~/entity/order.entity';
import {
  ExchangeTransaction,
  TransactionStatus,
} from '~/entity/exchange-transaction.entity';
import { OrderItem } from '~/entity/order-item.entity';

// ページング用のインターフェース
export interface PaginationParams {
  page: number;
  limit: number;
}

// ページング結果のインターフェース
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
@Injectable()
export class TokenExchnageDao {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(ExchangeTransaction)
    private readonly transactionRepository: Repository<ExchangeTransaction>,
    @InjectRepository(ExchangeTransactionCoupon)
    private readonly exchangeTransactionCouponRepository: Repository<ExchangeTransactionCoupon>,
  ) {}

  /* ================================
     Cart 関連操作
  ================================ */
  public async createCart(userId: string): Promise<Cart> {
    const cart = this.cartRepository.create({ userId });
    return await this.cartRepository.save(cart);
  }

  public async findCartByUserId(userId: string): Promise<Cart | undefined> {
    return await this.cartRepository.findOne({
      where: { userId },
      relations: ['cartItems', 'cartItems.product'],
    });
  }

  public async findCartById(cartId: string): Promise<Cart | undefined> {
    return await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['cartItems', 'cartItems.product'],
    });
  }

  public async updateCart(cart: Cart): Promise<Cart> {
    return await this.cartRepository.save(cart);
  }

  public async deleteCart(cartId: string): Promise<void> {
    await this.cartRepository.delete({ id: cartId });
  }

  public async clearUserCart(userId: string): Promise<void> {
    await this.cartRepository.delete({ userId });
  }

  /* ================================
     CartItem 関連操作
  ================================ */
  public async createCartItem(
    cart: Cart,
    product: Product,
    quantity: number,
  ): Promise<CartItem> {
    if (!cart || !cart.id) {
      throw new Error('Invalid cart provided');
    }
    if (!product || !product.id) {
      throw new Error('Invalid product provided');
    }
    const cartItem = this.cartItemRepository.create({
      cart,
      product,
      quantity,
      status: CartStatus.ACTIVE,
    });
    return await this.cartItemRepository.save(cartItem);
  }

  public async findCartItemByIdAndUserId(
    cartItemId: string,
    userId: string,
  ): Promise<CartItem | undefined> {
    return await this.cartItemRepository.findOne({
      where: { id: cartItemId, cart: { userId } },
      relations: ['cart', 'product'],
    });
  }

  public async findCartItem(
    cartId: string,
    productId: string,
  ): Promise<CartItem | undefined> {
    return await this.cartItemRepository.findOne({
      where: { cart: { id: cartId }, product: { id: productId } },
    });
  }

  public async findCartItemsByCartId(cartId: string): Promise<CartItem[]> {
    return await this.cartItemRepository.find({
      where: { cart: { id: cartId } },
      relations: ['product'],
    });
  }

  public async saveCartItem(cartItem: CartItem): Promise<CartItem> {
    return await this.cartItemRepository.save(cartItem);
  }

  public async deleteCartItem(cartItem: CartItem): Promise<void> {
    await this.cartItemRepository.remove(cartItem);
  }

  /* ================================
     Product 関連操作
  ================================ */
  public async findProductById(
    productId: string,
  ): Promise<Product | undefined> {
    return await this.productRepository.findOne({ where: { id: productId } });
  }

  public async updateProductStock(
    product: Product,
    quantity: number,
  ): Promise<Product> {
    product.availableQuantity -= quantity;
    return await this.productRepository.save(product);
  }

  public async findAllProducts(
    page: number,
    limit: number,
  ): Promise<[Product[], number]> {
    return await this.productRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
      where: { isVisible: true },
    });
  }

  /* ================================
     Order 関連操作
  ================================ */
  public async createOrder(
    userId: string,
    totalTokens: number,
    status: string,
  ): Promise<Order> {
    const order = this.orderRepository.create({ userId, totalTokens, status });
    return await this.orderRepository.save(order);
  }

  public createOrderItem(data: Partial<OrderItem>): OrderItem {
    return this.orderItemRepository.create(data);
  }

  public async findOrderById(orderId: string): Promise<Order | undefined> {
    return await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'orderItems.product'],
    });
  }

  public async saveOrder(order: Order): Promise<Order> {
    return await this.orderRepository.save(order);
  }

  public async saveOrderItem(orderItem: OrderItem): Promise<OrderItem> {
    return await this.orderItemRepository.save(orderItem);
  }

  public async updateOrderStatus(
    orderId: string,
    status: string,
  ): Promise<UpdateResult> {
    return await this.orderRepository.update(orderId, { status });
  }

  /**
   * ユーザーIDに基づいて注文履歴を取得（ページング対応）
   */
  async findOrdersByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<any>> {
    // ページング設定
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    // 総件数取得
    const totalCount = await this.orderRepository.count({
      where: { userId },
    });

    // 注文情報取得（orderItemsとproduct情報を含む）
    const orders = await this.orderRepository.find({
      where: {
        userId,
        status: TransactionStatus.COMPLETED,
      },
      relations: ['orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // 注文がなければ空の結果を返す
    if (orders.length === 0) {
      return {
        data: [],
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const orderTransactions = await this.transactionRepository.find({
          where: {
            order: { id: order.id },
            status: TransactionStatus.COMPLETED,
          },
          relations: ['coupons'],
          order: { createdAt: 'DESC' },
        });

        return {
          ...order,
          transactions: orderTransactions || [],
        };
      }),
    );

    // ページングメタデータ付きで結果を返す
    return {
      data: enrichedOrders,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  // クーポン関連のメソッド
  async findCouponById(couponId: string): Promise<ExchangeTransactionCoupon> {
    const coupon = await this.exchangeTransactionCouponRepository.findOne({
      where: { id: couponId },
      relations: ['transaction'],
    });

    if (!coupon) {
      throw new NotFoundException('クーポンが見つかりません');
    }

    return coupon;
  }

  async findTransactionById(
    transactionId: string,
  ): Promise<ExchangeTransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('取引が見つかりません');
    }

    return transaction;
  }

  async updateCouponUsageStatus(
    couponId: string,
    isUsed: boolean,
  ): Promise<ExchangeTransactionCoupon> {
    const coupon = await this.findCouponById(couponId);
    coupon.markedAsUsed = isUsed;
    return this.exchangeTransactionCouponRepository.save(coupon);
  }

  /* ================================
     ExchangeTransaction 関連操作
  ================================ */
  public createTransaction(
    data: Partial<ExchangeTransaction>,
  ): ExchangeTransaction {
    return this.transactionRepository.create(data);
  }

  public async saveTransaction(
    transaction: ExchangeTransaction,
  ): Promise<ExchangeTransaction> {
    return await this.transactionRepository.save(transaction);
  }

  public async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    solanaTransactionId?: string,
  ): Promise<void> {
    await this.transactionRepository.update(transactionId, {
      status,
      solanaTransactionId,
    });
  }

  public async findTransactionsByUserId(
    userId: string,
  ): Promise<ExchangeTransaction[]> {
    return await this.transactionRepository.find({
      where: { userId },
      relations: ['order', 'order.orderItems', 'order.orderItems.product'],
    });
  }

  public async updateSolanaTransactionId(
    transactionId: string,
    solanaTransactionId: string,
  ): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new NotFoundException('トランザクションが見つかりません。');
    }
    transaction.solanaTransactionId = solanaTransactionId;
    await this.transactionRepository.save(transaction);
  }

  /* ================================
     ExchangeTransactionCoupon 関連操作
  ================================ */
  public async exchangeTransactionCouponInsert({
    transaction,
    couponCode,
  }): Promise<ExchangeTransactionCoupon> {
    return await this.exchangeTransactionCouponRepository.save({
      transaction: { id: transaction },
      couponCode,
    });
  }
}
