import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldMasterDao } from '~/dao/field-master.dao';
import { TrophyDao } from '~/dao/trophy.dao';
import { FieldMaster } from '~/entity/field-master.entity';
import { Trophy } from '~/entity/trophy.entity';
import { TrophyController } from './trophy.controller';
import { TrophyService } from './trophy.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trophy, FieldMaster])],
  controllers: [TrophyController],
  providers: [TrophyService, TrophyDao, FieldMasterDao],
  exports: [TypeOrmModule],
})
export class TrophyModule {}
