import { Injectable } from '@nestjs/common';
import { MerchandiseSearchModel } from '~/admin-merchandise/model/admin-search-merchandise-request.model';
import { MerchandiseDao } from '~/dao/merchandise.dao';
import { CustomMerchandiseDetailEntity } from '~/entity/custom/custom-merchandise-detail.entity';
import { Merchandise } from '~/entity/merchandise.entity';

@Injectable()
export class MerchandiseService {
  constructor(private readonly merchandiseDao: MerchandiseDao) {}

  async getMyMerchandise(
    userName: string,
  ): Promise<CustomMerchandiseDetailEntity[]> {
    return await this.merchandiseDao.queryMerchandise(
      new MerchandiseSearchModel({ userName }),
    );
  }

  async getMerchandise(id: string): Promise<Merchandise> {
    return await this.merchandiseDao.getMerchandise(id);
  }
}
