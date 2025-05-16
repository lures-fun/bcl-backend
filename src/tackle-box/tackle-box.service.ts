import { Injectable } from '@nestjs/common';
import { TackleBoxModel } from './model/tackle-box.model';
import { LureDao } from '~/dao/lure.dao';

@Injectable()
export class TackleBoxService {
  constructor(private readonly lureDao: LureDao) {}

  async getTackleBoxes(userName: string): Promise<TackleBoxModel[]> {
    const res = await this.lureDao.queryLures(userName);
    return Promise.resolve(TackleBoxModel.toModel(res));
  }

  async getLegendaryTackleBoxes(userName: string) {
    return await this.lureDao.filterHallOfFameLures(userName)
  }
}
