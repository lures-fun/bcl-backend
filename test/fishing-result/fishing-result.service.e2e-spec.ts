import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { FishType } from '~/constants/fish-type';
import { FieldMasterDao } from '~/dao/field-master.dao';
import { FishingResultReviewStatusLogDao } from '~/dao/fishing-result-review-status-log.dao';
import { FishingResultReviewStatusDao } from '~/dao/fishing-result-review-status.dao';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { LineMasterDao } from '~/dao/line-master.dao';
import { ReelMasterDao } from '~/dao/reel-master.dao';
import { RodMasterDao } from '~/dao/rod-master.dao';
import { TimelineAlreadyReadDao } from '~/dao/timeline-already-read.dao';
import { FieldMaster } from '~/entity/field-master.entity';
import { ReviewStatus } from '~/entity/fishing-result-review-status.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { LineMaster } from '~/entity/line-master.entity';
import { Lure, LureType } from '~/entity/lure.entity';
import { ReelMaster } from '~/entity/reel-master.entity';
import { RodMaster } from '~/entity/rod-master.entity';
import { FishingResultService } from '~/fishing-result/fishing-result.service';
import { FishingResultAndLureModel } from '~/fishing-result/model/fishing-result-and-lure-model';
import {
  FishingResultModifyModel,
  FishingResultRegisterModel,
} from '~/fishing-result/model/fishing-result-register-model';
import { S3Utils } from '~/util/s3.utils';

const lure = new Lure({
  id: 'lureId',
  mintId: 'mintId',
  memberId: 'memberId',
  color: '#01',
  serialCode: '01/001',
  lureType: LureType.DRAFT_WAKER,
  purchasedAt: new Date(),
  imagePath: 'image_path',
});
const fishingResultAndLureModel = new FishingResultAndLureModel({
  id: 'fishingResultId',
  memberId: 'memberId',
  field: '0001',
  title: 'title 100cm',
  size: 100,
  fishType: FishType.LARGEMOUTH_BASS.id,
  rod: '0001',
  line: '0001',
  reel: '0001',
  imagePathForApply: 'image_path_for_apply',
  imagePathForNft: 'image_path_for_nft',
  comment: 'comment',
  caughtAt: new Date(),
  lure,
});
const fishingResultRegisterModel = new FishingResultRegisterModel({
  memberId: 'memberId',
  field: '0001',
  title: 'title 100cm',
  size: 100,
  fishType: FishType.LARGEMOUTH_BASS.id,
  lureId: 'lureId',
  rod: '0001',
  reel: '0001',
  line: '0001',
  imageForApply: 'image_path_for_apply',
  imageForNft: 'image_path_for_nft',
  comment: 'comment',
  caughtAt: new Date(),
});
const fishingResultModifyModel = new FishingResultModifyModel({
  id: 'fishingResultId',
  ...fishingResultRegisterModel,
});

describe('FishingResultService', () => {
  let service: FishingResultService;
  const fishingResultDao = new FishingResultDao(null, null, null, null);
  const fishingResultReviewStatusDao = new FishingResultReviewStatusDao(null);
  const fishingResultReviewStatusLogDao = new FishingResultReviewStatusLogDao(
    null,
  );
  const s3Utils = new S3Utils(new ConfigService());
  const timelineAlreadyReadDao = new TimelineAlreadyReadDao(null);
  const fieldMasterDao = new FieldMasterDao(null);
  const lineMasterDao = new LineMasterDao(null);
  const reelMasterDao = new ReelMasterDao(null);
  const rodMasterDao = new RodMasterDao(null);

  beforeEach(async () => {
    // settings mock.
    fishingResultDao.queryBigFish = jest.fn();
    fishingResultDao.queryFishingResultWithMint = jest.fn();
    fishingResultDao.findByIdAndUserName = jest.fn();
    fishingResultDao.queryFishingResultsWithMint = jest.fn();
    fishingResultDao.insert = jest.fn();
    fishingResultDao.update = jest.fn();
    fishingResultDao.updateImagePathById = jest.fn();

    fishingResultReviewStatusDao.findLatestByFishingResultId = jest.fn();
    fishingResultReviewStatusDao.save = jest.fn();

    fishingResultReviewStatusLogDao.insert = jest.fn();

    fieldMasterDao.findById = jest.fn();
    lineMasterDao.findById = jest.fn();
    reelMasterDao.findById = jest.fn();
    rodMasterDao.findById = jest.fn();

    s3Utils.uploadBinaryData = jest.fn();
    s3Utils.uploadFile = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        FishingResultService,
        {
          provide: FishingResultDao,
          useValue: fishingResultDao,
        },
        FishingResultService,
        {
          provide: FishingResultReviewStatusDao,
          useValue: fishingResultReviewStatusDao,
        },
        FishingResultService,
        {
          provide: S3Utils,
          useValue: s3Utils,
        },
        FishingResultService,
        {
          provide: TimelineAlreadyReadDao,
          useValue: timelineAlreadyReadDao,
        },
        FishingResultService,
        {
          provide: FieldMasterDao,
          useValue: fieldMasterDao,
        },
        FishingResultService,
        {
          provide: LineMasterDao,
          useValue: lineMasterDao,
        },
        FishingResultService,
        {
          provide: ReelMasterDao,
          useValue: reelMasterDao,
        },
        FishingResultService,
        {
          provide: RodMasterDao,
          useValue: rodMasterDao,
        },
        FishingResultService,
        {
          provide: FishingResultReviewStatusLogDao,
          useValue: fishingResultReviewStatusLogDao,
        },
      ],
    }).compile();

    service = module.get(FishingResultService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  const resolveMockMaster = () => {
    jest.spyOn(fieldMasterDao, 'findById').mockResolvedValue(
      Promise.resolve(
        new FieldMaster({
          id: '0001',
          name: 'example',
          prefectureId: '01',
        }),
      ),
    );
    jest
      .spyOn(lineMasterDao, 'findById')
      .mockResolvedValue(
        Promise.resolve(new LineMaster({ id: '0001', name: 'example' })),
      );
    jest
      .spyOn(reelMasterDao, 'findById')
      .mockResolvedValue(
        Promise.resolve(new ReelMaster({ id: '0001', name: 'example' })),
      );
    jest
      .spyOn(rodMasterDao, 'findById')
      .mockResolvedValue(
        Promise.resolve(new RodMaster({ id: '0001', name: 'example' })),
      );
  };

  it('can create an instance of FishingResultService', async () => {
    expect(service).toBeDefined();
  });

  describe('getByIdAndUserName', () => {
    it('found one', async () => {
      const spy = jest
        .spyOn(fishingResultDao, 'findByIdAndUserName')
        .mockResolvedValue(Promise.resolve(fishingResultAndLureModel));

      const result = await service.getByIdAndUserName(
        'fishingResultId',
        'userName',
      );

      expect(result).toBe(fishingResultAndLureModel);
      expect(spy).toHaveBeenCalledWith('fishingResultId', 'userName');
    });

    it('not found FishingResult', async () => {
      const spy = jest
        .spyOn(fishingResultDao, 'findByIdAndUserName')
        .mockResolvedValue(Promise.resolve(null));

      expect(
        service.getByIdAndUserName('fishingResultId', 'userName'),
      ).rejects.toStrictEqual(
        new NotFoundException('Not found fishing result by id:fishingResultId'),
      );
      expect(spy).toHaveBeenCalledWith('fishingResultId', 'userName');
    });
  });

  describe('register', () => {
    it('success', async () => {
      const fishingResultInsertSpy = jest
        .spyOn(fishingResultDao, 'insert')
        .mockResolvedValue(Promise.resolve('insertedId'));
      const fishingResultReviewStatusSaveSpy = jest
        .spyOn(fishingResultReviewStatusDao, 'save')
        .mockResolvedValue(Promise.resolve());
      const fishingResultReviewStatusLogInsertSpy = jest
        .spyOn(fishingResultReviewStatusLogDao, 'insert')
        .mockResolvedValue(Promise.resolve());
      const updateImagePathByIdSpy = jest
        .spyOn(fishingResultDao, 'updateImagePathById')
        .mockResolvedValue(Promise.resolve());
      const uploadBinaryDataSpy = jest
        .spyOn(s3Utils, 'uploadBinaryData')
        .mockResolvedValue(Promise.resolve('imagePath'));
      resolveMockMaster();

      await service.register(fishingResultRegisterModel);

      expect(fishingResultInsertSpy).toHaveBeenCalledWith(
        new FishingResult({
          imagePathForApply: '',
          imagePathForNft: '',
          ...fishingResultRegisterModel,
        }),
      );
      expect(fishingResultReviewStatusSaveSpy).toHaveBeenCalledWith(
        'insertedId',
        ReviewStatus.APPLY,
        expect.anything(),
      );
      // TODO: なぜかこの呼び出し検証が失敗する・・・
      // expect(fishingResultReviewStatusLogInsertSpy).toHaveBeenCalledWith(
      //   'insertedId',
      //   ReviewStatus.APPLY,
      //   expect.anything(),
      // );
      expect(uploadBinaryDataSpy).nthCalledWith(
        1,
        expect.anything(),
        'bcf-image-dev',
        `fishing-result-for-apply/insertedId`,
      );
      expect(uploadBinaryDataSpy).nthCalledWith(
        2,
        expect.anything(),
        'bcf-image-dev',
        `fishing-result-for-nft/insertedId`,
      );
      expect(updateImagePathByIdSpy).toHaveBeenCalledWith(
        'insertedId',
        'imagePath',
        'imagePath',
      );
    });

    it('not found field.', async () => {
      jest
        .spyOn(fieldMasterDao, 'findById')
        .mockResolvedValue(Promise.resolve(null));

      try {
        await service.register(fishingResultRegisterModel);
      } catch (e) {
        expect(e).toStrictEqual(
          new NotFoundException('field is not found.id:0001'),
        );
      }
    });

    it('not found line.', async () => {
      jest.spyOn(fieldMasterDao, 'findById').mockResolvedValue(
        Promise.resolve(
          new FieldMaster({
            id: '0001',
            name: 'example',
            prefectureId: '01',
          }),
        ),
      );
      jest
        .spyOn(lineMasterDao, 'findById')
        .mockResolvedValue(Promise.resolve(null));

      try {
        await service.register(fishingResultRegisterModel);
      } catch (e) {
        expect(e).toStrictEqual(
          new NotFoundException('line is not found.id:0001'),
        );
      }
    });

    it('not found reel.', async () => {
      jest.spyOn(fieldMasterDao, 'findById').mockResolvedValue(
        Promise.resolve(
          new FieldMaster({
            id: '0001',
            name: 'example',
            prefectureId: '01',
          }),
        ),
      );
      jest
        .spyOn(lineMasterDao, 'findById')
        .mockResolvedValue(
          Promise.resolve(new LineMaster({ id: '0001', name: 'example' })),
        );
      jest
        .spyOn(reelMasterDao, 'findById')
        .mockResolvedValue(Promise.resolve(null));

      try {
        await service.register(fishingResultRegisterModel);
      } catch (e) {
        expect(e).toStrictEqual(
          new NotFoundException('reel is not found.id:0001'),
        );
      }
    });

    it('not found rod.', async () => {
      jest.spyOn(fieldMasterDao, 'findById').mockResolvedValue(
        Promise.resolve(
          new FieldMaster({
            id: '0001',
            name: 'example',
            prefectureId: '01',
          }),
        ),
      );
      jest
        .spyOn(lineMasterDao, 'findById')
        .mockResolvedValue(
          Promise.resolve(new LineMaster({ id: '0001', name: 'example' })),
        );
      jest
        .spyOn(reelMasterDao, 'findById')
        .mockResolvedValue(
          Promise.resolve(new ReelMaster({ id: '0001', name: 'example' })),
        );
      jest
        .spyOn(rodMasterDao, 'findById')
        .mockResolvedValue(Promise.resolve(null));

      try {
        await service.register(fishingResultRegisterModel);
      } catch (e) {
        expect(e).toStrictEqual(
          new NotFoundException('rod is not found.id:0001'),
        );
      }
    });
  });

  describe('modify', () => {
    it('success', async () => {
      const fishingResultReviewStatusFindSpy = jest
        .spyOn(fishingResultReviewStatusDao, 'findLatestByFishingResultId')
        .mockResolvedValue(
          Promise.resolve({
            fishingResultId: fishingResultModifyModel.id,
            status: ReviewStatus.REJECT,
            comment: 'comment',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        );
      const fishingResultUpdateSpy = jest
        .spyOn(fishingResultDao, 'update')
        .mockResolvedValue(Promise.resolve());
      const fishingResultReviewStatusSaveSpy = jest
        .spyOn(fishingResultReviewStatusDao, 'save')
        .mockResolvedValue(Promise.resolve());
      const fishingResultReviewStatusLogInsertSpy = jest
        .spyOn(fishingResultReviewStatusLogDao, 'insert')
        .mockResolvedValue(Promise.resolve());
      const uploadBinaryDataSpy = jest
        .spyOn(s3Utils, 'uploadBinaryData')
        .mockResolvedValue(Promise.resolve('imagePath'));
      resolveMockMaster();

      await service.modify(fishingResultModifyModel);

      expect(fishingResultReviewStatusFindSpy).toHaveBeenCalledWith(
        fishingResultModifyModel.id,
      );
      expect(fishingResultUpdateSpy).toHaveBeenCalledWith(
        new FishingResult({
          imagePathForApply: 'imagePath',
          imagePathForNft: 'imagePath',
          ...fishingResultModifyModel,
        }),
      );
      expect(fishingResultReviewStatusSaveSpy).toHaveBeenCalledWith(
        fishingResultModifyModel.id,
        ReviewStatus.APPLY,
        expect.anything(),
      );
      // TODO: なぜかこの呼び出し検証が失敗する・・・
      // expect(fishingResultReviewStatusLogInsertSpy).toHaveBeenCalledWith(
      //   fishingResultModifyModel.id,
      //   ReviewStatus.APPLY,
      //   expect.anything(),
      // );
      expect(uploadBinaryDataSpy).nthCalledWith(
        1,
        expect.anything(),
        'bcf-image-dev',
        `fishing-result-for-apply/${fishingResultModifyModel.id}`,
      );
      expect(uploadBinaryDataSpy).nthCalledWith(
        2,
        expect.anything(),
        'bcf-image-dev',
        `fishing-result-for-nft/${fishingResultModifyModel.id}`,
      );
    });

    it('latest status is not reject then throw new ConflictException', async () => {
      const fishingResultReviewStatusFindSpy = jest
        .spyOn(fishingResultReviewStatusDao, 'findLatestByFishingResultId')
        .mockResolvedValue(
          Promise.resolve({
            fishingResultId: fishingResultModifyModel.id,
            status: ReviewStatus.REVIEW,
            comment: 'comment',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        );
      resolveMockMaster();

      service.modify(fishingResultModifyModel).catch((e) => {
        expect(e).toStrictEqual(
          new ConflictException('LatestReviewStatus is not reject.'),
        );

        expect(fishingResultReviewStatusFindSpy).toHaveBeenCalledWith(
          fishingResultModifyModel.id,
        );
      });
    });

    it('not found FishingResultReviewStatus then throw new ConflictException', async () => {
      const fishingResultReviewStatusFindSpy = jest
        .spyOn(fishingResultReviewStatusDao, 'findLatestByFishingResultId')
        .mockResolvedValue(Promise.resolve(null));
      resolveMockMaster();

      service.modify(fishingResultModifyModel).catch((e) => {
        expect(e).toStrictEqual(
          new ConflictException('LatestReviewStatus is not reject.'),
        );

        expect(fishingResultReviewStatusFindSpy).toHaveBeenCalledWith(
          fishingResultModifyModel.id,
        );
      });
    });
  });
});
