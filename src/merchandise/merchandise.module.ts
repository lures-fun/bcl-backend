import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchandiseDao } from '~/dao/merchandise.dao';
import { Member } from '~/entity/member.entity';
import { Merchandise } from '~/entity/merchandise.entity';
import { MerchandiseController } from './merchandise.controller';
import { MerchandiseService } from './merchandise.service';

@Module({
  imports: [TypeOrmModule.forFeature([Merchandise, Member])],
  controllers: [MerchandiseController],
  providers: [MerchandiseService, MerchandiseDao],
  exports: [TypeOrmModule],
})
export class MerchandiseModule {}
