import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TokenExchangeService } from './token-exchange.service';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CartItem } from '~/entity/cart-item.entity';
import { Product } from '~/entity/product.entity';
import { Order } from '~/entity/order.entity';
import {
  ExchangeTransaction,
  TransactionStatus,
} from '~/entity/exchange-transaction.entity';
import { AuthGuard } from '@nestjs/passport';
import { Member } from '~/entity/member.entity';
import { Cart } from '~/entity/cart.entity';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('token-exchange')
@UseInterceptors(ClassSerializerInterceptor)
export class TokenExchangeController {
  constructor(private readonly tokenExchangeService: TokenExchangeService) {}

  @Get('discount')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'shopifyのprice rule id を発行する' })
  async getDiscount() {
    const res = await this.tokenExchangeService.createPriceRule();
    return { discountCode: res };
  }

  @ApiOperation({ summary: 'shopifyディスカウントクーポンを発行する' })
  @UseGuards(AuthGuard('jwt'))
  @Post('create-discount')
  async createDiscount(productId) {
    const res = await this.tokenExchangeService.createDiscountCode(productId);
    return { discountCode: res };
  }

  @Get('products')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '商品一覧を取得（ページング対応）' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'ページ番号',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: '1ページあたりの商品の数',
  })
  @ApiResponse({
    status: 200,
    description: '商品一覧を正常に取得しました。',
    type: [Product],
  })
  async getProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.tokenExchangeService.getProducts(page, limit);
  }

  @Get('products/:productId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '商品詳細を取得' })
  @ApiResponse({
    status: 200,
    description: '商品詳細を正常に取得しました。',
    type: Product,
  })
  async getProductById(
    @Param('productId') productId: string,
  ): Promise<Product> {
    return await this.tokenExchangeService.getProductById(productId);
  }

  @Get('cart')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '特定ユーザーのアクティブなカートを取得する' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'カートを取得しました。',
    type: Cart,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'アクティブなカートが見つかりません。',
  })
  async getCartByUser(@Req() req: { user: Member }): Promise<Cart> {
    return this.tokenExchangeService.getCartByUserId(req.user.id);
  }

  @Post('cart')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '新しいカートを作成する' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'カートが作成されました。',
    type: Cart,
  })
  async createCart(@Req() req: { user: Member }): Promise<Cart> {
    return this.tokenExchangeService.createCart(req.user.id);
  }

  @Post('cart/add')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'カートに商品を追加する' })
  @ApiResponse({ status: HttpStatus.OK, isArray: true })
  async addToCart(@Body() addToCartDto, @Req() req: { user: Member }) {
    const cartItem = await this.tokenExchangeService.addProductToCart(
      req.user.id,
      addToCartDto,
    );
    return { message: '商品がカートに追加されました。', cartItem };
  }

  @Patch('cart/items/:cartItemId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'カートアイテムの更新' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'カートアイテムを更新しました。',
    type: CartItem,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'カートアイテムが見つかりません。',
  })
  async updateCartItem(
    @Param('cartItemId') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Req() req: { user: Member },
  ) {
    const userId = req.user.id;
    const updatedItem = await this.tokenExchangeService.updateCartItem(
      userId,
      cartItemId,
      updateCartItemDto,
    );
    if (!updatedItem) {
      throw new HttpException(
        'カートアイテムが見つかりません。',
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedItem;
  }

  @Delete('cart/items/:cartItemId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'カート内のアイテムを削除する' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'カートアイテムが削除されました。',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'カートアイテムが見つかりません。',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'アクセス権がありません。',
  })
  async deleteCartItem(
    @Param('cartItemId') cartItemId: string,
    @Req() req,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.tokenExchangeService.deleteCartItem(userId, cartItemId);
    return { message: 'カートアイテムが削除されました。' };
  }

  @Get('orders/history')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'ユーザーの注文履歴を取得' })
  @ApiResponse({ status: 200, description: '注文履歴の取得に成功' })
  async getOrderHistory(@Req() req) {
    const userId = req.user.id;
    return this.tokenExchangeService.findOrdersByUserId(userId);
  }

  @Post('orders')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '注文を作成する' })
  @ApiResponse({
    status: 201,
    description: '注文が正常に作成されました。',
    type: Order,
  })
  @ApiResponse({ status: 400, description: '不正なリクエストです。' })
  async createOrder(@Req() req: { user: Member }): Promise<Order> {
    return this.tokenExchangeService.createOrder(req.user.id);
  }

  @Get('orders/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '注文IDを使って注文を取得する' })
  @ApiResponse({
    status: 200,
    description: '注文の詳細を取得しました。',
    type: Order,
  })
  async getOrder(@Param('id') id: string): Promise<Order> {
    return this.tokenExchangeService.getOrderById(id);
  }

  @Get('coupons/:id/check-usage')
  @ApiOperation({ summary: 'クーポンの使用状態を確認' })
  @ApiResponse({ status: 200, description: 'クーポン状態の確認に成功' })
  async checkCouponUsage(
    @Param('id') couponId: string,
    @Req() req: { user: Member },
  ) {
    const userId = req.user.id;
    const isUsed = await this.tokenExchangeService.checkCouponUsage(
      couponId,
      userId,
    );
    return { isUsed };
  }

  @Patch('coupons/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'クーポンの使用状態を更新' })
  @ApiResponse({ status: 200, description: 'クーポンの使用状態の更新に成功' })
  async updateCouponUsage(
    @Param('id') couponId: string,
    @Req() req: { user: Member },
    @Body() body: { isUsed: boolean },
  ) {
    const userId = req.user.id;
    await this.tokenExchangeService.updateCouponUsage(
      couponId,
      userId,
      body.isUsed,
    );
    return { success: true };
  }

  @Get('transaction')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'ユーザーの取引履歴を取得する' })
  @ApiResponse({
    status: 200,
    description: '取引履歴を取得しました。',
    isArray: true,
    type: ExchangeTransaction,
  })
  async getTransactions(
    @Query('userId') userId: string,
  ): Promise<ExchangeTransaction[]> {
    return this.tokenExchangeService.getTransactionsByUserId(userId);
  }

  @Get('transaction/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '取引IDを使って特定の取引を取得する' })
  @ApiResponse({
    status: 200,
    description: '取引の詳細を取得しました。',
    type: ExchangeTransaction,
  })
  async getTransactionById(
    @Param('id') id: string,
  ): Promise<ExchangeTransaction> {
    return this.tokenExchangeService.getTransactionById(id);
  }

  @Post('checkout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'トークン交換処理（カート対応・Shopifyクーポン対応）',
  })
  @ApiResponse({
    status: 200,
    description: '決済が正常に開始されました。',
    type: String,
  })
  async checkout(@Req() req: { user: Member }, @Body() checkoutData) {
    try {
      const result = await this.tokenExchangeService.checkoutForCart(
        req.user,
        checkoutData,
      );
      return result;
    } catch (error) {
      console.error('決済エラー:', error);
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          '決済処理中に予期しないエラーが発生しました。',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }
}
