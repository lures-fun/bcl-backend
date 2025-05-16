import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { DeleteResult, EntityManager, Repository } from 'typeorm';
import { CustomFollowUnionSearchEntity } from '~/entity/custom/custom-follow-union-search.entity';
import { CustomMemberListEntity } from '~/entity/custom/custom-member-list.entity';
import { Follow } from '~/entity/follow.entity';

@Injectable()
export class FollowDao {
  constructor(
    @InjectRepository(Follow) private followRepository: Repository<Follow>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  public async save(follow: Follow): Promise<Follow> {
    return await this.followRepository.save(follow);
  }

  public async delete(id: string): Promise<DeleteResult> {
    return await this.followRepository.delete({ id });
  }

  public async findOne(
    memberId: string,
    followedMemberId: string,
  ): Promise<Follow> {
    return await this.followRepository.findOne({
      where: {
        memberId: memberId,
        followedMemberId: followedMemberId,
      },
    });
  }

  public async findMyFollower(memberId: string): Promise<Follow[]> {
    return await this.followRepository.find({
      where: {
        followedMemberId: memberId,
      },
    });
  }

  public async getFollowers(
    memberId: string,
  ): Promise<CustomMemberListEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/follow.query-follower-list.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [memberId, memberId]);
    return CustomMemberListEntity.toCustomEntities(res);
  }

  public async getOthersFollowers(
    memberId: string,
    myMemberId: string,
  ): Promise<CustomMemberListEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/follow.query-follower-list.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [myMemberId, memberId]);
    return CustomMemberListEntity.toCustomEntities(res);
  }

  public async getFollowees(
    memberId: string,
  ): Promise<CustomMemberListEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/follow.query-followee-list.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [memberId, memberId]);
    return CustomMemberListEntity.toCustomEntities(res);
  }

  public async getOthersFollowees(
    memberId: string,
    myMemberId: string,
  ): Promise<CustomMemberListEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/follow.query-followee-list.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [myMemberId, memberId]);
    return CustomMemberListEntity.toCustomEntities(res);
  }

  public async getUnionSearch(
    memberId: string,
    searchText: string,
    limit: number,
  ): Promise<CustomFollowUnionSearchEntity[]> {
    const sql = readFileSync('src/dao/mapper/follow.union-search.sql', 'utf-8');
    const filterName = '%' + searchText + '%';
    const res = await this.entityManager.query(sql, [
      memberId,
      memberId,
      filterName,
      filterName,
      filterName,
      limit,
    ]);
    return CustomFollowUnionSearchEntity.toCustomEntities(res);
  }
}
