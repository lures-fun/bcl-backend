import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldMasterDao } from '~/dao/field-master.dao';
import { LineMasterDao } from '~/dao/line-master.dao';
import { ReelMasterDao } from '~/dao/reel-master.dao';
import { RodMasterDao } from '~/dao/rod-master.dao';
import { TrophyTypeMasterDao } from '~/dao/trophy-type-master.dao';
import { FieldMaster } from '~/entity/field-master.entity';
import { LineMaster } from '~/entity/line-master.entity';
import { ReelMaster } from '~/entity/reel-master.entity';
import { RodMaster } from '~/entity/rod-master.entity';
import { TrophyTypeMaster } from '~/entity/trophy-type-master.entity';
import { MasterController } from '~/master/master.controller';
import { MasterService } from '~/master/master.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldMaster,
      ReelMaster,
      RodMaster,
      LineMaster,
      TrophyTypeMaster,
    ]),
  ],
  providers: [
    MasterService,
    FieldMasterDao,
    ReelMasterDao,
    RodMasterDao,
    LineMasterDao,
    TrophyTypeMasterDao,
  ],
  controllers: [MasterController],
  exports: [TypeOrmModule],
})
export class MasterModule {}
