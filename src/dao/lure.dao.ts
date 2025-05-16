import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { EntityManager, Like, Repository } from 'typeorm';
import { ORDER } from '~/admin-fishing-results/dto/fishing-result-search.dto';
import { AdminSearchLuresRequestDto } from '~/admin-lures/dto/admin-search-lures-request-dto';
import { CustomAdminSearchLureDetailEntity } from '~/entity/custom/lure.query-admin-search-lure.entity';
import { CustomLureDetailWithStatusEntity } from '~/entity/custom/lure.query-lure-with-status.entity';
import { CustomLureTrophyEntity } from '~/entity/custom/lure.query-trophies.entity';
import { LureReviewStatusLog } from '~/entity/lure-review-status-log.entity';
import { LureReviewStatus } from '~/entity/lure-review-status.entity';
import { Lure, LureType } from '~/entity/lure.entity';
import { Member } from '~/entity/member.entity';
import { MintType } from '~/entity/mint-master.entity';

@Injectable()
export class LureDao {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Lure) private lureRepository: Repository<Lure>,
    @InjectRepository(LureReviewStatus)
    private lureReviewStatusRepository: Repository<LureReviewStatus>,
    @InjectRepository(LureReviewStatusLog)
    private lureReviewStatusLogRepository: Repository<LureReviewStatusLog>,
  ) {}

  public async queryLures(
    userName: string,
  ): Promise<CustomLureDetailWithStatusEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/lure.query-lures.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [userName]);
    return CustomLureDetailWithStatusEntity.toEntities(res);
  }

  public async queryLure(
    lureId: string,
  ): Promise<CustomLureDetailWithStatusEntity> {
    const sql = readFileSync(
      'src/dao/mapper/lure.query-lure.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [lureId, lureId]);
    return CustomLureDetailWithStatusEntity.toEntity(res[0]);
  }

  public async queryApprovedLuresByUserNameAndTypeAndColor(
    userName: string,
    lureType: LureType,
    color: string,
  ): Promise<Lure[]> {
    const sql = readFileSync(
      'src/dao/mapper/lure.query-lures-by-username-type-color.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [
      userName,
      lureType,
      color,
    ]);
    return Lure.toEntities(res);
  }

  public async queryAdminSearchLures(
    adminSearchLuresRequestDto: AdminSearchLuresRequestDto,
  ): Promise<CustomAdminSearchLureDetailEntity[]> {
    const query = this.entityManager
      .createQueryBuilder()
      .select(
        `
        lure.created_at,
        lure.id,
        lure.mint_id,
        lure.member_id,
        lure.color,
        lure.serial_code,
        lure.lure_type,
        lure.purchased_at,
        lure.image_path_for_apply,
        lure.image_path_for_nft,
        lure_review_status.status,
        member.last_name,
        member.first_name,
        member.user_name,
        member.email
      `,
      )
      .from(Lure, 'lure')
      .innerJoin(Member, 'member', 'lure.member_id = member.id')
      .innerJoin(
        LureReviewStatus,
        'lure_review_status',
        'lure_review_status.lure_id = lure.id',
      );
    if (adminSearchLuresRequestDto.reviewStatus) {
      query.andWhere(`lure_review_status.status = :reviewStatus`, {
        reviewStatus: `${adminSearchLuresRequestDto.reviewStatus}`,
      });
    }
    if (adminSearchLuresRequestDto.userName) {
      query.andWhere(`member.user_name LIKE :username`, {
        username: `%${adminSearchLuresRequestDto.userName}%`,
      });
    }
    if (adminSearchLuresRequestDto.firstName) {
      query.andWhere(`member.first_name LIKE :firstName`, {
        firstName: `%${adminSearchLuresRequestDto.firstName}%`,
      });
    }
    if (adminSearchLuresRequestDto.lastName) {
      query.andWhere(`member.last_name LIKE :lastName`, {
        lastName: `%${adminSearchLuresRequestDto.lastName}%`,
      });
    }
    if (adminSearchLuresRequestDto.email) {
      query.andWhere(`member.email LIKE :email`, {
        email: `%${adminSearchLuresRequestDto.email}%`,
      });
    }
    query.orderBy(`lure.created_at`, ORDER.DESC);
    return CustomAdminSearchLureDetailEntity.toEntities(
      await query.getRawMany(),
    );
  }

  public async queryTrophies(
    lureId: string,
  ): Promise<CustomLureTrophyEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/lure.query-trophies.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [lureId, MintType.TITLE]);
    return CustomLureTrophyEntity.toEntities(res);
  }

  public async findById(id: string): Promise<Lure> {
    return await this.lureRepository.findOne({ where: { id } });
  }

  public async findByLureTypeAndSerialCode(
    lureType: LureType,
    serialCode: string,
  ): Promise<Lure[]> {
    return await this.lureRepository.find({
      where: {
        lureType: lureType,
        serialCode,
      },
    });
  }

  public async findByLureTypeColorAndMemberId(
    lureType: LureType,
    color: string,
    memberId: string,
  ): Promise<Lure[]> {
    return await this.lureRepository.find({
      where: { lureType, color, memberId },
    });
  }

  public async findSerialCodeByLureTypeAndColor(
    lureType: LureType,
    color: string,
  ): Promise<any> {
    return await this.lureRepository.findOne({
      where: { lureType, color },
      order: { serialCode: ORDER.DESC },
    });
  }

  public async insert(entity: Lure): Promise<string> {
    const insertResult = await this.lureRepository.insert(entity);
    return insertResult.generatedMaps[0].id;
  }

  public async update(entity: Lure): Promise<void> {
    await this.lureRepository.update({ id: entity.id }, entity);
  }

  public async updateIsLostById(id: string, isLost: boolean): Promise<void> {
    await this.lureRepository.update({ id }, { isLost });
  }

  public async updateImagePathById(
    id: string,
    imagePathForApply: string,
  ): Promise<void> {
    await this.lureRepository.update({ id }, { imagePathForApply });
  }

  public async updateImagePathForNftById(
    id: string,
    imagePathForNft: string,
  ): Promise<void> {
    await this.lureRepository.update({ id }, { imagePathForNft });
  }

  public async updateMintIdById(id: string, mintId: string): Promise<void> {
    await this.lureRepository.update({ id }, { mintId });
  }

  public async filterHallOfFameLures(userName: string) {
    const sql = readFileSync(
      'src/dao/mapper/lure.query-filter-legendary-lure.sql',
      'utf-8',
    );
    return this.entityManager.query(sql, [userName]);
  }

  public async updateLegendaryStatus(id: string): Promise<void> {
    await this.lureRepository.update({ id }, { legendary: true });
  }

  public async findLuresToMint(): Promise<Lure[]> {
    const lures = await this.lureRepository.find({
      where: {
        mintId: Like('dmint-%'),
      },
    });

    return lures;
  }

  public async findDigitalLuresToMint(): Promise<Lure[]> {
    const lures = await this.lureRepository.find({
      where: {
        mintId: Like('dluremint-%'),
      },
    });

    return lures;
  }
}
