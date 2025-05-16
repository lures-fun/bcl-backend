import { BadRequestException, Injectable } from '@nestjs/common';
import { FieldMasterDao } from '~/dao/field-master.dao';
import { LureType } from '~/entity/lure.entity';
import { TrophyType } from '~/entity/trophy.entity';
import { TrophyDao } from '../dao/trophy.dao';
import { TrophyDetailModel } from './model/trophy-detail.model';
import { TrophyListModel } from './model/trophy-list.model';

@Injectable()
export class TrophyService {
  constructor(
    private readonly trophyDao: TrophyDao,
    private readonly fieldMasterDao: FieldMasterDao,
  ) {}

  async searchTrophies(
    lureType: LureType,
    trophyType: TrophyType,
  ): Promise<TrophyListModel[]> {
    if (
      lureType !== LureType.DRAFT_WAKER &&
      lureType !== LureType.W3_CRANKBAIT
    ) {
      throw new BadRequestException('Invalid lure type');
    }
    const trophies = TrophyListModel.toModels(
      await this.trophyDao.findContestTrophy(lureType, trophyType),
    );
    switch (trophyType) {
      case TrophyType.FIELD:
        return await this.getFieldTrophies(trophies);
      case TrophyType.COLOR:
        return await this.getColorTrophies(trophies);
      default:
        return trophies;
    }
  }

  async getColorTrophies(
    trophies: TrophyListModel[],
  ): Promise<TrophyListModel[]> {
    const colorTrophies = [];
    for (let i = 1; i < 11; i++) {
      const color = i < 10 ? `0${i}` : `${i}`;
      const filteredTrophies = trophies.filter((t) => t.color === color);
      if (filteredTrophies.length > 0) {
        colorTrophies.push(...filteredTrophies);
      } else {
        colorTrophies.push(new TrophyListModel({ color }));
      }
    }
    return colorTrophies;
  }

  async getFieldTrophies(
    trophies: TrophyListModel[],
  ): Promise<TrophyListModel[]> {
    const fieldTrophies = [];
    const fieldMaster = await this.fieldMasterDao.selectByEnabled();
    fieldMaster.map((f) => {
      const filteredTrophies = trophies.filter((t) => t.field === f.id);
      if (filteredTrophies.length > 0) {
        fieldTrophies.push(...filteredTrophies);
      } else {
        fieldTrophies.push(new TrophyListModel({ field: f.id }));
      }
    });
    return fieldTrophies;
  }

  async getTrophy(trophyId: string): Promise<TrophyDetailModel> {
    const trophy = await this.trophyDao.getTrophy(trophyId);
    if (!trophy) {
      throw new BadRequestException('Invalid trophy id');
    }
    return TrophyDetailModel.toModels(await this.trophyDao.getTrophy(trophyId));
  }
}
