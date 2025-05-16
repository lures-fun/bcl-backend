import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductId, ShopifyProducts } from '~/entity/shopify-products.entity';

@Injectable()
export class ShopifyProductsDao {
  constructor(
    @InjectRepository(ShopifyProducts)
    private shopifyProductsRepository: Repository<ShopifyProducts>,
  ) {}

  public async findDigitalLureByProductId(
    productId: string,
  ): Promise<ShopifyProducts> {
    return await this.shopifyProductsRepository.findOne({
      where: {
        productId: productId as ProductId,
      },
    });
  }
}
