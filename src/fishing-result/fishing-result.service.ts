import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FieldMasterDao } from '~/dao/field-master.dao';
import { FishingResultReviewStatusLogDao } from '~/dao/fishing-result-review-status-log.dao';
import { FishingResultReviewStatusDao } from '~/dao/fishing-result-review-status.dao';
import { LineMasterDao } from '~/dao/line-master.dao';
import { ReelMasterDao } from '~/dao/reel-master.dao';
import { RodMasterDao } from '~/dao/rod-master.dao';
import { ReviewStatus } from '~/entity/fishing-result-review-status.entity';
import { FishingResult } from '~/entity/fishing-result.entity';
import { DateUtils } from '~/util/date.utils';
import { FishingResultDao } from '../dao/fishing-result.dao';
import { FishingResultAndLureModel } from './model/fishing-result-and-lure-model';
import {
  FishingResultModifyModel,
  FishingResultRegisterModel,
} from './model/fishing-result-register-model';

@Injectable()
export class FishingResultService {
  constructor(
    private readonly fishingResultDao: FishingResultDao,
    private readonly fishingResultReviewStatusDao: FishingResultReviewStatusDao,
    private readonly fishingResultReviewStatusLogDao: FishingResultReviewStatusLogDao,
    private readonly fieldMasterDao: FieldMasterDao,
    private readonly lineMasterDao: LineMasterDao,
    private readonly reelMasterDao: ReelMasterDao,
    private readonly rodMasterDao: RodMasterDao,
  ) {}

  async getByIdAndUserName(
    id: string,
    userName: string,
  ): Promise<FishingResultAndLureModel> {
    const fishingResult = await this.fishingResultDao.findByIdAndUserName(
      id,
      userName,
    );
    if (!fishingResult) {
      throw new NotFoundException(`Not found fishing result by id:${id}`);
    }

    return fishingResult;
  }

  // 公式釣果申請とその他釣果申請の違いがlureId・imageForApplyの有無だけなので同じfunctionを利用する
  // TODO 分岐処理が多くなった場合はfunctionを分ける
  async register(model: FishingResultRegisterModel): Promise<void> {
    await this.checkExistsMasterId(model);
    const extensionForApply = model.imageForApply?.match(/\.([^.\/]+)$/)?.[1];
    const extensionForNft = model.imageForNft.match(/\.([^.\/]+)$/)?.[1];
    const extensionForSizeConfirmation =
      model.imageForSizeConfirmation.match(/\.([^.\/]+)$/)?.[1];
    const fishingResultId = await this.fishingResultDao.insert(
      new FishingResult({
        memberId: model.memberId,
        field: model.field,
        title: model.title,
        size: model.size,
        fishType: model.fishType,
        lureId: model.lureId,
        freeTextLure: model.freeTextLure,
        rod: model.rod,
        line: model.line,
        reel: model.reel,
        imagePathForApply: model.imageForApply,
        imagePathForNft: model.imageForNft,
        imagePathForSizeConfirmation: model.imageForSizeConfirmation,
        comment: model.comment,
        caughtAt: model.caughtAt,
        extensionForApply,
        extensionForNft,
        extensionForSizeConfirmation,
      }),
    );
    this.saveReviewStatus(
      fishingResultId,
      ReviewStatus.APPLY,
      `${DateUtils.formatDate(
        new Date(),
      )} に釣果申請依頼が来ました。レビューを行ってください。`,
    );
  }

  // 公式釣果再申請とその他釣果再申請の違いがlureId・imageForApplyの有無だけなので同じfunctionを利用する
  // TODO 分岐処理が多くなった場合はfunctionを分ける
  async modify(model: FishingResultModifyModel): Promise<void> {
    await this.checkExistsMasterId(model);

    const latestReviewStatus =
      await this.fishingResultReviewStatusDao.findLatestByFishingResultId(
        model.id,
      );
    if (
      !latestReviewStatus ||
      latestReviewStatus.status !== ReviewStatus.REJECT
    ) {
      throw new ConflictException('LatestReviewStatus is not reject.');
    }

    const extensionForApply = model.imageForApply?.match(/\.([^.\/]+)$/)?.[1];
    const extensionForNft = model.imageForNft.match(/\.([^.\/]+)$/)?.[1];
    const extensionForSizeConfirmation =
      model.imageForSizeConfirmation.match(/\.([^.\/]+)$/)?.[1];
    await this.fishingResultDao.update(
      new FishingResult({
        id: model.id,
        memberId: model.memberId,
        field: model.field,
        title: model.title,
        size: model.size,
        fishType: model.fishType,
        lureId: model.lureId,
        rod: model.rod,
        line: model.line,
        reel: model.reel,
        imagePathForApply: model.imageForApply,
        imagePathForNft: model.imageForNft,
        imagePathForSizeConfirmation: model.imageForSizeConfirmation,
        comment: model.comment,
        caughtAt: model.caughtAt,
        extensionForApply,
        extensionForNft,
        extensionForSizeConfirmation,
      }),
    );

    this.saveReviewStatus(
      model.id,
      ReviewStatus.APPLY,
      `${DateUtils.formatDate(
        new Date(),
      )} に釣果再申請依頼が来ました。レビューを行ってください。`,
    );
  }

  private async saveReviewStatus(
    fishingResultId: string,
    reviewStatus: ReviewStatus,
    comment: string,
  ) {
    await this.fishingResultReviewStatusDao.save(
      fishingResultId,
      reviewStatus,
      comment,
    );
    await this.fishingResultReviewStatusLogDao.insert(
      fishingResultId,
      reviewStatus,
      comment,
    );
  }

  private async checkExistsMasterId(model: FishingResultRegisterModel) {
    const field = await this.fieldMasterDao.findById(model.field);
    if (!field) {
      throw new NotFoundException(`field is not found.id:${model.field}`);
    }

    const line = await this.lineMasterDao.findById(model.line);
    if (!line) {
      throw new NotFoundException(`line is not found.id:${model.line}`);
    }

    const reel = await this.reelMasterDao.findById(model.reel);
    if (!reel) {
      throw new NotFoundException(`reel is not found.id:${model.reel}`);
    }

    const rod = await this.rodMasterDao.findById(model.rod);
    if (!rod) {
      throw new NotFoundException(`rod is not found.id:${model.rod}`);
    }
  }
}
