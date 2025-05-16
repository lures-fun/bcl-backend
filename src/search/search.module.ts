import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { PostDao } from '~/dao/post.dao';
import { FishingResult } from '~/entity/fishing-result.entity';
import { Member } from '~/entity/member.entity';
import { Post } from '~/entity/post.entity';
import { MemberDao } from '../dao/member.dao';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([Member, FishingResult, Post])],
  providers: [SearchService, MemberDao, FishingResultDao, PostDao],
  controllers: [SearchController],
  exports: [TypeOrmModule],
})
export class SearchModule {}
