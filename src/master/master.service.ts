import { Injectable } from '@nestjs/common';
import { FieldMasterDao } from '~/dao/field-master.dao';
import { LineMasterDao } from '~/dao/line-master.dao';
import { ReelMasterDao } from '~/dao/reel-master.dao';
import { RodMasterDao } from '~/dao/rod-master.dao';
import { FieldMaster } from '~/entity/field-master.entity';
import { LineMaster } from '~/entity/line-master.entity';
import { ReelMaster } from '~/entity/reel-master.entity';
import { RodMaster } from '~/entity/rod-master.entity';
import { TrophyTypeMaster } from '~/entity/trophy-type-master.entity';
import { TrophyTypeMasterDao } from '../dao/trophy-type-master.dao';

@Injectable()
export class MasterService {
  constructor(
    private readonly fieldMasterDao: FieldMasterDao,
    private readonly reelMasterDao: ReelMasterDao,
    private readonly rodMasterDao: RodMasterDao,
    private readonly lineMasterDao: LineMasterDao,
    private readonly trophyTypeMasterDao: TrophyTypeMasterDao,
  ) {}

  async getActiveFields(): Promise<FieldMaster[]> {
    return this.fieldMasterDao.selectByEnabled();
  }

  async getActiveReels(): Promise<ReelMaster[]> {
    return this.reelMasterDao.selectByEnabled();
  }

  async getActiveRods(): Promise<RodMaster[]> {
    return this.rodMasterDao.selectByEnabled();
  }

  async getActiveLines(): Promise<LineMaster[]> {
    return this.lineMasterDao.selectByEnabled();
  }

  async getActiveTrophyTypes(): Promise<TrophyTypeMaster[]> {
    return this.trophyTypeMasterDao.selectByEnabled();
  }
}
