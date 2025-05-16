import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { DeleteResult, EntityManager, Repository } from 'typeorm';
import { CustomMemberListEntity } from '~/entity/custom/custom-member-list.entity';
import { Good, GoodType } from '~/entity/good.entity';

@Injectable()
export class GoodDao {
  constructor(
    @InjectRepository(Good) private goodRepository: Repository<Good>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  public async register(
    memberId: string,
    parentId: string,
    type: GoodType,
  ): Promise<Good> {
    const existedGood = await this.findOne(memberId, parentId);
    if (existedGood) {
      return;
    }
    return await this.goodRepository.save(
      new Good({ memberId, parentId, type }),
    );
  }

  public async delete(
    memberId: string,
    parentId: string,
  ): Promise<DeleteResult> {
    const existedGood = await this.findOne(memberId, parentId);
    if (!existedGood) {
      return;
    }
    return await this.goodRepository.delete({ id: existedGood.id });
  }

  public async findOne(memberId: string, parentId: string): Promise<Good> {
    return await this.goodRepository.findOne({
      where: {
        memberId: memberId,
        parentId: parentId,
      },
    });
  }

  public async countGood(parentId: string): Promise<number> {
    return await this.goodRepository.count({
      where: {
        parentId,
      },
    });
  }

  public async countGoodByParentIdAndMemberId(
    parentId: string,
    memberId: string,
  ): Promise<number> {
    return await this.goodRepository.count({
      where: {
        parentId,
        memberId,
      },
    });
  }

  public async getGoodMembers(
    memberId: string,
    parentId: string,
  ): Promise<CustomMemberListEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/member.query-good-member-list.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [memberId, parentId]);
    return CustomMemberListEntity.toCustomEntities(res);
  }
}
