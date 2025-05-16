import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { EntityManager, Like, Repository } from 'typeorm';
import { AdminTrophySearchRequestModel } from '~/admin-trophy/model/admin-trophy-search-request.model';
import { Contest } from '~/entity/contest.entity';
import { CustomMyTrophyEntity } from '~/entity/custom/trophy.query-my-trophy.entity';
import { CustomTrophyDetailEntity } from '~/entity/custom/trophy.query-trophy-detail.entity';
import { CustomTrophyListEntity } from '~/entity/custom/trophy.query-trophy-list.entity';
import { LureType } from '~/entity/lure.entity';
import { Member } from '~/entity/member.entity';
import { Trophy, TrophyType } from '~/entity/trophy.entity';

@Injectable()
export class TrophyDao {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Trophy) private trophyRepository: Repository<Trophy>,
  ) {}

  public async queryMyTrophies(
    memberId: string,
  ): Promise<CustomMyTrophyEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/trophy.query-my-trophy.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [memberId]);
    return CustomMyTrophyEntity.toCustomEntity(res);
  }

  public async countByLureTypeAndColor(
    userName: string,
    lureType: LureType,
    color: string,
  ): Promise<number> {
    const sql = readFileSync(
      'src/dao/mapper/trophy.count-tropy-with-mint-by-lure-type-and-color.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [
      userName,
      lureType,
      color,
    ]);

    if (res.length == null || res.length > 1) {
      return null;
    }

    return res[0].count;
  }

  public async search(
    model: AdminTrophySearchRequestModel,
  ): Promise<CustomMyTrophyEntity[]> {
    const query = this.entityManager
      .createQueryBuilder()
      .select(
        `
        trophy.id as trophy_id,
        contest.id as contest_id,
        trophy.member_id,
        trophy.fishing_result_id,
        trophy.image_path,
        trophy.trophy_type,
        trophy.title as trophy_title,
        trophy.content as trophy_content,
        contest.title as contest_title,
        contest.content as contest_content,
        contest.field,
        contest.image_path as contest_image_path
      `,
      )
      .from(Trophy, 'trophy')
      .innerJoin(Member, 'member', 'trophy.member_id = member.id')
      .leftJoin(Contest, 'contest', 'trophy.contest_id = contest.id');
    if (model.trophyTitle) {
      query.andWhere(`trophy.title LIKE :trophyTitle`, {
        trophyTitle: `%${model.trophyTitle}%`,
      });
    }
    if (model.username) {
      query.andWhere(`member.user_name LIKE :username`, {
        username: `%${model.username}%`,
      });
    }
    if (model.field) {
      query.andWhere(`contest.field = :field`, {
        field: model.field,
      });
    }
    return CustomMyTrophyEntity.toCustomEntity(await query.getRawMany());
  }

  public async findContestTrophy(
    lureType: LureType,
    trophyType: TrophyType,
  ): Promise<CustomTrophyListEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/trophy.query-trophy-list.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [lureType, trophyType]);
    return CustomTrophyListEntity.toCustomEntity(res);
  }

  public async getTrophy(trophyId: string): Promise<CustomTrophyDetailEntity> {
    const sql = readFileSync(
      'src/dao/mapper/trophy.query-trophy-detail.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [trophyId]);
    return CustomTrophyDetailEntity.toCustomEntity(res);
  }

  public async findOneByMemberIdAndContestId(
    memberId: string,
    contestId: string,
  ): Promise<Trophy> {
    return await this.trophyRepository.findOneBy({
      memberId,
      contestId,
    });
  }

  public async save(trophy: Trophy): Promise<Trophy> {
    return await this.trophyRepository.save(trophy);
  }
  public async delete(id: string): Promise<void> {
    await this.trophyRepository.delete({ id });
  }

  public async findTrophiesToMint(): Promise<Trophy[]> {
    const trophies = await this.trophyRepository.find({
      where: {
        mintId: Like('dmint-%'),
      },
    });

    return trophies;
  }
}
