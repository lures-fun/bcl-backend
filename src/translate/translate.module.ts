import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslateController } from './translate.controller';
import { TranslateService } from './translate.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [TranslateController],
  providers: [TranslateService],
  exports: [TypeOrmModule],
})
export class TranslateModule {}
