import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { EntityManager, Like, Repository } from 'typeorm';
import {
  FishingResultSearchDto,
  ORDER,
  SORT,
} from '~/admin-fishing-results/dto/fishing-result-search.dto';
import { AdminFishingResultModel } from '~/admin-fishing-results/model/admin-fishing-result.model';
import { CustomFishingResultWithUserNameEntity } from '~/entity/custom/fishing-result-with-user-name.entity';
import { CustomFishingResultWithMintEntity } from '~/entity/custom/fishing.query-fishing-result-with-mint.entity';
import { FieldMaster } from '~/entity/field-master.entity';
import {
  FishingResultReviewStatus,
  ReviewStatus,
} from '~/entity/fishing-result-review-status.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { Lure, LureType } from '~/entity/lure.entity';
import { Member } from '~/entity/member.entity';
import { MintType } from '~/entity/mint-master.entity';
import { FishingResultAndLureModel } from '~/fishing-result/model/fishing-result-and-lure-model';
import { FishingResultDetailModel } from '~/fishing-result/model/fishing-result-detail-model';

@Injectable()
export class FishingResultDao {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(FishingResult)
    private fishingResultRepository: Repository<FishingResult>,
  ) {}

  public async queryBigFish(lureId: string): Promise<number> {
    const sql = readFileSync(
      'src/dao/mapper/fishing-result.query-big-fish.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [
      ReviewStatus.APPROVE,
      lureId,
    ]);

    if (res.length == null || res.length > 1) {
      return null;
    }

    return res[0].size;
  }

  public async queryFishingResultWithMint(
    lureId: string,
  ): Promise<CustomFishingResultWithMintEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/fishing-result.query-fishing-result-with-mint.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [
      ReviewStatus.APPROVE,
      lureId,
      MintType.LURE,
    ]);
    return CustomFishingResultWithMintEntity.toCustomEntity(res);
  }

  public async findBigFishByLureTypeAndColor(
    userName: string,
    lureType: LureType,
    color: string,
  ): Promise<number> {
    const sql = readFileSync(
      'src/dao/mapper/fishing-result.query-big-fish-by-lure-type-and-color.mapper.sql',
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

    return res[0].size;
  }

  public async countFishingResultNFTByLureTypeAndColor(
    userName: string,
    lureType: LureType,
    color: string,
  ): Promise<number> {
    const sql = readFileSync(
      'src/dao/mapper/fishing-result.count-fishing-result-with-mint-by-lure-type-and-color.mapper.sql',
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

  public async findById(id: string): Promise<FishingResult> {
    return this.fishingResultRepository.findOne({ where: { id } });
  }

  public async findByIdWithMaster(
    id: string,
  ): Promise<FishingResultDetailModel> {
    const sql = readFileSync(
      'src/dao/mapper/fishing-result.query-detail-with-master.mapper.sql',
      'utf-8',
    );
    const raws = await this.entityManager.query(sql, [id]);
    return FishingResultDetailModel.buildFromRaws(raws);
  }

  public async findByIdAndUserName(
    id: string,
    userName: string,
  ): Promise<FishingResultAndLureModel> {
    const sql = readFileSync(
      'src/dao/mapper/fishing-result.query-detail.mapper.sql',
      'utf-8',
    );
    const raws = await this.entityManager.query(sql, [userName, id]);
    return FishingResultAndLureModel.buildFromRaws(raws);
  }

  public async queryFishingResultsWithMint(
    memberId: string,
  ): Promise<CustomFishingResultWithMintEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/fishing-result.query-fishing-results-with-mint.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [
      ReviewStatus.APPROVE,
      memberId,
      MintType.FISHING_RESULT,
    ]);
    return CustomFishingResultWithMintEntity.toCustomEntity(res);
  }

  public async queryFishingResultsByLureIdWithMint(
    memberId: string,
    lureId: string,
  ): Promise<CustomFishingResultWithMintEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/fishing-result.query-fishing-results-by-lure-id-with-mint.mapper.sql',
      'utf-8',
    );
    const res = await this.entityManager.query(sql, [
      ReviewStatus.APPROVE,
      memberId,
      MintType.FISHING_RESULT,
      lureId,
    ]);
    return CustomFishingResultWithMintEntity.toCustomEntity(res);
  }

  public async insert(entity: FishingResult): Promise<string> {
    const insertResult = await this.fishingResultRepository.insert(entity);
    return insertResult.generatedMaps[0].id;
  }

  public async update(entity: FishingResult): Promise<void> {
    await this.fishingResultRepository.update({ id: entity.id }, entity);
  }

  public async updateImagePathById(
    id: string,
    imagePathForApply: string | null,
    imagePathForNft: string,
    imagePathForSizeConfirmation: string,
  ): Promise<void> {
    await this.fishingResultRepository.update(
      { id },
      { imagePathForApply, imagePathForNft, imagePathForSizeConfirmation },
    );
  }

  public async updateMintIdById(id: string, mintId: string): Promise<void> {
    await this.fishingResultRepository.update({ id }, { mintId });
  }

  public async adminFishingResultSearch(
    fishingResultSearchDto: FishingResultSearchDto,
  ): Promise<AdminFishingResultModel[]> {
    const query = this.entityManager
      .createQueryBuilder()
      .select(
        `
        fishing_result.*,
        member.user_name,
        lure.lure_type,
        lure.color,
        field_master.id as field_id,
        field_master.name as field_name,
        fishing_result_review_status.status 
      `,
      )
      .from(FishingResult, 'fishing_result')
      .innerJoin(Member, 'member', 'fishing_result.member_id = member.id')
      .leftJoin(Lure, 'lure', 'fishing_result.lure_id = lure.id')
      .innerJoin(
        FieldMaster,
        'field_master',
        'fishing_result.field = field_master.id',
      )
      .leftJoin(
        FishingResultReviewStatus,
        'fishing_result_review_status',
        'fishing_result_review_status.fishing_result_id = fishing_result.id',
      );
    if (fishingResultSearchDto.title) {
      query.andWhere(`fishing_result.title LIKE :title`, {
        title: `%${fishingResultSearchDto.title}%`,
      });
    }
    if (fishingResultSearchDto.username) {
      query.andWhere(`member.user_name LIKE :username`, {
        username: `%${fishingResultSearchDto.username}%`,
      });
    }
    if (fishingResultSearchDto.field) {
      query.andWhere(`field_master.id = :field`, {
        field: fishingResultSearchDto.field,
      });
    }
    if (fishingResultSearchDto.fishType) {
      query.andWhere(`fishing_result.fish_type = :fishType`, {
        fishType: fishingResultSearchDto.fishType,
      });
    }
    if (fishingResultSearchDto.lureType) {
      query.andWhere(`lure.lure_type = :lureType`, {
        lureType: fishingResultSearchDto.lureType,
      });
    }
    if (fishingResultSearchDto.lureColor) {
      query.andWhere(`lure.color = :lureColor`, {
        lureColor: fishingResultSearchDto.lureColor,
      });
    }
    if (fishingResultSearchDto.status) {
      query.andWhere(`fishing_result_review_status.status = :status`, {
        status: fishingResultSearchDto.status,
      });
    }
    if (
      fishingResultSearchDto.sort != undefined &&
      fishingResultSearchDto.order != undefined
    ) {
      if (
        fishingResultSearchDto.sort == SORT.SIZE ||
        fishingResultSearchDto.sort == SORT.CREATED_AT ||
        fishingResultSearchDto.sort == SORT.CAUGHT_AT
      ) {
        fishingResultSearchDto.order == ORDER.DESC
          ? query.orderBy(
              `fishing_result.${fishingResultSearchDto.sort}`,
              ORDER.DESC,
            )
          : query.orderBy(
              `fishing_result.${fishingResultSearchDto.sort}`,
              ORDER.ASC,
            );
      }
    }
    return AdminFishingResultModel.toEntities(await query.getRawMany());
  }

  public async adminFishingResultSearchById(
    id: string,
  ): Promise<AdminFishingResultModel> {
    const sql = readFileSync(
      'src/dao/mapper/fishing-result.search-detail.mapper.sql',
      'utf-8',
    );

    const res = await this.entityManager.query(sql, [id]);
    return AdminFishingResultModel.toEntity(res);
  }

  public async selectByComment(
    text: string,
  ): Promise<CustomFishingResultWithUserNameEntity[]> {
    const sql = readFileSync(
      'src/dao/mapper/fishing-result.search-like.mapper.sql',
      'utf-8',
    );

    const raws = await this.entityManager.query(sql, [
      `%${text}%`,
      `%${text}%`,
      `%${text}%`,
      `%${text}%`,
      `%${text}%`,
      `%${text}%`,
      `%${text}%`,
      `%${text}%`,
      `%${text}%`,
    ]);
    return CustomFishingResultWithUserNameEntity.toCustomEntities(raws);
  }

  public async findFisingResultsToMint(): Promise<FishingResultDetailModel[]> {
    const fishingResults = await this.fishingResultRepository.find({
      where: {
        mintId: Like('dmint-%'),
      },
    });
    return fishingResults.map((res) => new FishingResultDetailModel(res));
  }
}
