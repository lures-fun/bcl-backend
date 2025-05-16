import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { FishType } from '~/constants/fish-type';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import {
  FishingResultReviewStatus,
  ReviewStatus,
} from '~/entity/fishing-result-review-status.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { Lure, LureType } from '~/entity/lure.entity';
import { Member, MemberRole } from '~/entity/member.entity';
import { MintMaster, MintType } from '~/entity/mint-master.entity';
import { TypeOrmConfigService } from '~/type-orm-config.service';
import { createDataSource } from './base-dao-test';

const fishingResult = new FishingResult({
  id: 'fishingResultId',
  memberId: 'memberId',
  field: '0001',
  title: 'title',
  size: 40,
  fishType: FishType.LARGEMOUTH_BASS.id,
  lureId: 'lureId',
  rod: '0001',
  line: '0001',
  reel: '0001',
  imagePathForApply: 'imagePathForApply',
  imagePathForNft: 'imagePathForNft',
  comment: 'comment',
  caughtAt: new Date('2023/08/09'),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const fishingResultBigFish = new FishingResult({
  id: 'fishingResultBigFish',
  memberId: 'memberId',
  field: '0001',
  title: 'title',
  size: 50,
  fishType: FishType.LARGEMOUTH_BASS.id,
  lureId: 'lureId',
  rod: '0001',
  line: '0001',
  reel: '0001',
  imagePathForApply: 'imagePathForApply',
  imagePathForNft: 'imagePathForNft',
  comment: 'comment',
  caughtAt: new Date('2023/08/09'),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const lure = new Lure({
  id: 'lureId',
  mintId: 'mintId',
  memberId: 'memberId',
  color: '#01',
  serialCode: '01/001',
  lureType: LureType.DRAFT_WAKER,
  purchasedAt: new Date('2023/08/09'),
  imagePath: 'image_path',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const fishingResultReviewStatus1 = new FishingResultReviewStatus({
  fishingResultId: 'fishingResultId',
  status: ReviewStatus.APPROVE,
  comment: 'comment1',
});

const fishingResultReviewStatus2 = new FishingResultReviewStatus({
  fishingResultId: 'fishingResultBigFish',
  status: ReviewStatus.APPROVE,
  comment: 'comment2',
});

const mint = new MintMaster({
  id: 'mintId',
  type: MintType.LURE,
  contentId: 'mintLureId',
});

const member = new Member({
  id: 'memberId',
  walletAddress: 'walletAddress',
  email: 'email',
  lastName: 'lastName',
  firstName: 'firstName',
  userName: 'userName',
  profileIcon: 'profileIcon',
  profileImage: 'profileImage',
  fishingCareer: 1,
  mainField: '0001',
  mainRod: '0002',
  mainReel: '0003',
  mainLine: '0004',
  introduction: 'introduction',
  role: MemberRole.Member,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('FishingResultDao', () => {
  let db: DataSource;
  let dao: FishingResultDao;

  const saveAllData = async () => {
    await db.getRepository(FishingResult).save(fishingResult);
    await db.getRepository(FishingResult).save(fishingResultBigFish);
    await db
      .getRepository(FishingResultReviewStatus)
      .save(fishingResultReviewStatus1);
    await db
      .getRepository(FishingResultReviewStatus)
      .save(fishingResultReviewStatus2);
    await db.getRepository(Lure).save(lure);
    await db.getRepository(MintMaster).save(mint);
    await db.getRepository(Member).save(member);
  };

  const clearAllData = async () => {
    await db.manager.clear(FishingResult);
    await db.manager.clear(FishingResultReviewStatus);
    await db.manager.clear(Lure);
    await db.manager.clear(MintMaster);
    await db.manager.clear(Member);
  };

  beforeAll(async () => {
    db = await createDataSource();
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `.env.${process.env.NODE_ENV}`,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useClass: TypeOrmConfigService,
        }),
        TypeOrmModule.forFeature([
          FishingResult,
          Lure,
          Member,
          FishingResultReviewStatus,
        ]),
      ],
      providers: [
        FishingResultDao,
        {
          provide: EntityManager,
          useValue: db.createEntityManager(),
        },
        {
          provide: Repository,
          useValue: Repository<FishingResult>,
        },
      ],
    }).compile();

    dao = module.get(FishingResultDao);
  });

  beforeEach(async () => {
    await saveAllData();
  });

  afterEach(async () => {
    await clearAllData();
  });

  describe('queryBigFish', () => {
    it('should return FishingResult', async () => {
      const result = await dao.queryBigFish('lureId');
      expect(result).toEqual(fishingResultBigFish.size);
    });

    it('notfound', async () => {
      const result = await dao.queryBigFish('id');
      expect(result).toBeNull();
    });
  });

  describe('queryFishingResultWithMint', () => {
    it('should return CustomFishingResultWithMintEntity', async () => {
      const result = await dao.queryFishingResultWithMint('lureId');
      expect(result).toEqual([
        {
          id: fishingResultBigFish.id,
          memberId: fishingResultBigFish.memberId,
          field: fishingResultBigFish.field,
          title: fishingResultBigFish.title,
          size: fishingResultBigFish.size,
          fishType: fishingResultBigFish.fishType,
          lureId: fishingResultBigFish.lureId,
          rod: fishingResultBigFish.rod,
          line: fishingResultBigFish.line,
          reel: fishingResultBigFish.reel,
          imagePathForApply: fishingResultBigFish.imagePathForApply,
          imagePathForNft: fishingResultBigFish.imagePathForNft,
          comment: fishingResultBigFish.comment,
          caughtAt: fishingResultBigFish.caughtAt,
          userName: member.userName,
          mintId: mint.id,
        },
        {
          id: fishingResult.id,
          memberId: fishingResult.memberId,
          field: fishingResult.field,
          title: fishingResult.title,
          size: fishingResult.size,
          fishType: fishingResult.fishType,
          lureId: fishingResult.lureId,
          rod: fishingResult.rod,
          line: fishingResult.line,
          reel: fishingResult.reel,
          imagePathForApply: fishingResult.imagePathForApply,
          imagePathForNft: fishingResult.imagePathForNft,
          comment: fishingResult.comment,
          caughtAt: fishingResult.caughtAt,
          userName: member.userName,
          mintId: mint.id,
        },
      ]);
    });
  });

  describe('findByIdAndUserName', () => {
    it('should return entity', async () => {
      const result = await dao.findByIdAndUserName(
        'fishingResultId',
        'userName',
      );
      expect(result).toEqual({
        id: fishingResult.id,
        memberId: fishingResult.memberId,
        field: fishingResult.field,
        title: fishingResult.title,
        size: fishingResult.size,
        fishType: fishingResult.fishType,
        lure: {
          id: lure.id,
          mintId: lure.mintId,
          memberId: lure.memberId,
          color: lure.color,
          serialCode: lure.serialCode,
          lureType: lure.lureType,
          purchasedAt: lure.purchasedAt,
          imagePath: lure.imagePath,
        },
        rod: fishingResult.rod,
        line: fishingResult.line,
        reel: fishingResult.reel,
        imagePathForApply: fishingResult.imagePathForApply,
        imagePathForNft: fishingResult.imagePathForNft,
        comment: fishingResult.comment,
        caughtAt: fishingResult.caughtAt,
      });
    });
  });

  describe('queryFishingResultsWithMint', () => {
    it('should return CustomFishingResultWithMintEntity', async () => {
      const result = await dao.queryFishingResultsWithMint('memberId');
      expect(result).toEqual([
        {
          id: fishingResultBigFish.id,
          memberId: fishingResultBigFish.memberId,
          field: fishingResultBigFish.field,
          title: fishingResultBigFish.title,
          size: fishingResultBigFish.size,
          fishType: fishingResultBigFish.fishType,
          lureId: fishingResultBigFish.lureId,
          rod: fishingResultBigFish.rod,
          line: fishingResultBigFish.line,
          reel: fishingResultBigFish.reel,
          imagePathForApply: fishingResultBigFish.imagePathForApply,
          imagePathForNft: fishingResultBigFish.imagePathForNft,
          comment: fishingResultBigFish.comment,
          caughtAt: fishingResultBigFish.caughtAt,
          userName: member.userName,
          mintId: mint.id,
        },
        {
          id: fishingResult.id,
          memberId: fishingResult.memberId,
          field: fishingResult.field,
          title: fishingResult.title,
          size: fishingResult.size,
          fishType: fishingResult.fishType,
          lureId: fishingResult.lureId,
          rod: fishingResult.rod,
          line: fishingResult.line,
          reel: fishingResult.reel,
          imagePathForApply: fishingResult.imagePathForApply,
          imagePathForNft: fishingResult.imagePathForNft,
          comment: fishingResult.comment,
          caughtAt: fishingResult.caughtAt,
          userName: member.userName,
          mintId: mint.id,
        },
      ]);
    });
  });

  describe('insert', () => {
    it('success', async () => {
      const entity = new FishingResult({
        memberId: 'memberId',
        field: '0001',
        title: 'title2',
        size: 60,
        fishType: FishType.LARGEMOUTH_BASS.id,
        lureId: 'lureId',
        rod: '0001',
        reel: '0001',
        line: '0001',
        imagePathForApply: '',
        imagePathForNft: '',
        comment: 'comment2',
        caughtAt: new Date('2023/08/09'),
      });

      const fishingResultId = await dao.insert(entity);
      const insertedFishingResult = await db
        .getRepository(FishingResult)
        .findOne({
          where: {
            id: fishingResultId,
          },
        });
      expect(insertedFishingResult).toStrictEqual(
        new FishingResult({
          id: fishingResultId,
          memberId: entity.memberId,
          field: entity.field,
          title: entity.title,
          size: entity.size,
          fishType: entity.fishType,
          lureId: entity.lureId,
          rod: entity.rod,
          reel: entity.reel,
          line: entity.line,
          comment: entity.comment,
          caughtAt: entity.caughtAt,
          imagePathForApply: '',
          imagePathForNft: '',
          // createdAt,updatedAtは検証しない
          createdAt: insertedFishingResult.createdAt,
          updatedAt: insertedFishingResult.updatedAt,
        }),
      );
    });
  });

  describe('update', () => {
    it('success', async () => {
      const entity = new FishingResult({
        id: 'fishingResultId',
        memberId: 'memberId',
        field: '0001',
        title: 'title100',
        size: 55,
        fishType: FishType.LARGEMOUTH_BASS.id,
        lureId: 'lureId',
        rod: '0001',
        reel: '0001',
        line: '0001',
        imagePathForApply: '',
        imagePathForNft: '',
        comment: 'comment100',
        caughtAt: new Date('2023/08/13'),
      });
      await dao.update(entity);

      const updatedResult = await db.getRepository(FishingResult).findOne({
        where: {
          id: entity.id,
        },
      });
      expect(updatedResult).toStrictEqual(
        new FishingResult({
          id: entity.id,
          memberId: entity.memberId,
          field: entity.field,
          title: entity.title,
          size: entity.size,
          fishType: entity.fishType,
          lureId: entity.lureId,
          rod: entity.rod,
          reel: entity.reel,
          line: entity.line,
          comment: entity.comment,
          caughtAt: entity.caughtAt,
          imagePathForApply: '',
          imagePathForNft: '',
          // createdAt,updatedAtは検証しない
          createdAt: updatedResult.createdAt,
          updatedAt: updatedResult.updatedAt,
        }),
      );
    });
  });
});
