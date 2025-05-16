import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { decode } from 'urlsafe-base64';
import { LureImageMasterDao } from '~/dao/lure-image-master.dao';
import { LureReviewStatusLogDao } from '~/dao/lure-review-status-log.dao';
import { LureReviewStatusDao } from '~/dao/lure-review-status.dao';
import { MintMasterDao } from '~/dao/mint-master.dao';
import { OneTimeTokenDao } from '~/dao/one-time-token.dao';
import { TrophyDao } from '~/dao/trophy.dao';
import { ReviewStatus } from '~/entity/lure-review-status.entity';
import { Lure, LureType, SERIAL_CODE_NOTHING } from '~/entity/lure.entity';
import { MintMaster, MintType } from '~/entity/mint-master.entity';
import { DateUtils } from '~/util/date.utils';
import { getExtension } from '~/util/file.utils';
import { issueDigitalLureMintId } from '~/util/mint.utils';
import { S3Utils } from '~/util/s3.utils';
import { FishingResultDao } from '../dao/fishing-result.dao';
import { LureDao } from '../dao/lure.dao';
import { ShopifyProductsDao } from './../dao/shopify-products.dao';
import { DigitalLureRegisterRequestDto } from './dto/digital-lure-register-request-dto';
import { FishingResultModel } from './model/fishing-result.model';
import { LureDetailModel } from './model/lure-detail.model';
import {
  LureModifyModel,
  LurePurchaseModel,
  LureRegisterModel,
} from './model/lure-register-model';
import { LureTrophyModel } from './model/lure-trophy.model';

@Injectable()
export class LureService {
  constructor(
    private readonly lureDao: LureDao,
    private readonly lureReviewStatusDao: LureReviewStatusDao,
    private readonly lureReviewStatusLogDao: LureReviewStatusLogDao,
    private readonly fishingResultDao: FishingResultDao,
    private readonly trophyDao: TrophyDao,
    private readonly lureImageMasterDao: LureImageMasterDao,
    private readonly oneTimeTokenDao: OneTimeTokenDao,
    private readonly mintMasterDao: MintMasterDao,
    private readonly shopifyProductsDao: ShopifyProductsDao,
    private readonly s3Utils: S3Utils,
    private readonly configService: ConfigService,
  ) {}

  async getLure(lureId: string): Promise<LureDetailModel> {
    const [lure, bigfish] = await Promise.all([
      this.lureDao.queryLure(lureId),
      this.fishingResultDao.queryBigFish(lureId),
    ]);
    if (!lure) {
      throw new NotFoundException(`The lure dose not exist. lureId: ${lureId}`);
    }
    return Promise.resolve(LureDetailModel.toModel(lure, bigfish));
  }

  async getFishingResults(lureId: string): Promise<FishingResultModel[]> {
    const entities = await this.fishingResultDao.queryFishingResultWithMint(
      lureId,
    );
    return Promise.resolve(FishingResultModel.toModel(entities));
  }

  async getTrophies(lureId: string): Promise<LureTrophyModel[]> {
    const entities = await this.lureDao.queryTrophies(lureId);
    return Promise.resolve(LureTrophyModel.toModels(entities));
  }

  async getApprovedLuresByUserNameAndTypeAndColor(
    userName: string,
    lureType: LureType,
    color: string,
  ): Promise<Lure[]> {
    return this.lureDao.queryApprovedLuresByUserNameAndTypeAndColor(
      userName,
      lureType,
      color,
    );
  }

  async getCountOfFishingNftByLureTypeAndColor(
    userName: string,
    lureType: LureType,
    color: string,
  ): Promise<number> {
    return this.fishingResultDao.countFishingResultNFTByLureTypeAndColor(
      userName,
      lureType,
      color,
    );
  }

  async getCountOfTitleNftByLureTypeAndColor(
    userName: string,
    lureType: LureType,
    color: string,
  ): Promise<number> {
    return this.trophyDao.countByLureTypeAndColor(userName, lureType, color);
  }

  async getBigFishByLureTypeAndColor(
    userName: string,
    lureType: LureType,
    color: string,
  ): Promise<number> {
    return this.fishingResultDao.findBigFishByLureTypeAndColor(
      userName,
      lureType,
      color,
    );
  }

  async registerLure(model: LureRegisterModel): Promise<string> {
    // ソフトルアー（シリアルコードが000）の場合はserialCodeの一意チェックを行わない
    const serialNumber = this.getSerialNumber(model.serialCode);
    if (serialNumber !== SERIAL_CODE_NOTHING) {
      // lureTypeとserialCodeで一意にしなければならない
      const isLureDuplicated = await this.isLureDuplicated(
        model.lureType,
        model.serialCode,
      );

      if (isLureDuplicated) {
        throw new ConflictException('LureType and serialCode must be unique.');
      }
    }

    const imagePathForNft = await this.getImagePathForNft(
      model.serialCode,
      model.lureType,
    );
    const lureId = await this.lureDao.insert(
      new Lure({
        imagePathForApply: '', // PKを利用してS3へアップロードするためまずは空で登録する
        imagePathForNft,
        purchasedAt: new Date(),
        ...model,
      }),
    );

    const extensionForApply = getExtension(model.image);
    const imagePath = await this.uploadImage(
      `${lureId}.${extensionForApply}`,
      model.image,
    );
    this.lureDao.updateImagePathById(lureId, imagePath);

    this.saveReviewStatus(
      lureId,
      ReviewStatus.APPLY,
      `${DateUtils.formatDate(
        new Date(),
      )} にルアー登録申請依頼が来ました。レビューを行ってください。`,
    );
    return lureId;
  }

  async modifyLure(model: LureModifyModel): Promise<void> {
    // 自分のルアー以外は更新できない
    const lure = await this.lureDao.findById(model.id);
    if (model.memberId !== lure.memberId) {
      throw new ForbiddenException(
        'Cannot change anything other than own lure.',
      );
    }
    // ソフトルアー（シリアルコードが000）の場合はserialCodeの一意チェックを行わない
    const serialNumber = this.getSerialNumber(model.serialCode);
    if (serialNumber !== SERIAL_CODE_NOTHING) {
      // lureTypeとserialCodeで一意にしなければならない
      const isLureDuplicated = await this.isLureDuplicated(
        model.lureType,
        model.serialCode,
      );
      if (isLureDuplicated) {
        throw new ConflictException('LureType and serialCode must be unique.');
      }

      const latestReviewStatus =
        await this.lureReviewStatusDao.findLatestByLureId(model.id);
      if (
        !latestReviewStatus ||
        latestReviewStatus.status !== ReviewStatus.REJECT
      ) {
        throw new ConflictException('LatestReviewStatus is not reject.');
      }

      // 申請用画像が再アップロードされた場合のみ画像再登録
      let imagePathForApply: string;
      if (model.image) {
        const extension = getExtension(model.image);
        imagePathForApply = await this.uploadImage(
          `${model.id}.${extension}`,
          model.image,
        );
      }

      const imagePathForNft = await this.getImagePathForNft(
        model.serialCode,
        model.lureType,
      );

      await this.lureDao.update(
        new Lure({
          id: model.id,
          imagePathForApply,
          imagePathForNft,
          purchasedAt: DateUtils.now(),
          memberId: model.memberId,
          lureType: model.lureType,
          color: model.color,
          serialCode: model.serialCode,
        }),
      );

      this.saveReviewStatus(
        model.id,
        ReviewStatus.APPLY,
        `${DateUtils.formatDate(
          DateUtils.now(),
        )} にルアー登録再申請依頼が来ました。レビューを行ってください。`,
      );
    }
  }

  async purchaseLureWithQR(model: LurePurchaseModel): Promise<string> {
    const serialCode = await this.generateSerialCode(
      model.lureType,
      model.color,
    );
    const lureModel: LureRegisterModel = {
      memberId: model.memberId,
      lureType: model.lureType,
      color: model.color,
      image: model.image,
      serialCode,
    };

    const isLureDuplicated = await this.isLureDuplicated(
      model.lureType,
      model.memberId,
      model.color,
    );

    if (isLureDuplicated) {
      throw new ConflictException(
        'A user cannot purchase the same lure type and color.',
      );
    }

    const lureId = await this.registerLure(lureModel);
    return Promise.resolve(lureId);
  }

  async applyForLost(memberId: string, lureId: string) {
    const lure = await this.lureDao.findById(lureId);
    if (!lure) {
      throw new NotFoundException(`lure is not found.id: ${lureId}`);
    }

    if (lure.memberId !== memberId) {
      throw new ForbiddenException('Cannot update other lures.');
    }

    this.lureDao.updateIsLostById(lureId, true);
  }

  async registerDigitalLure(
    id: string,
    token: string,
    requestDigitalLureDto: DigitalLureRegisterRequestDto,
  ) {
    const tokenRecord = await this.oneTimeTokenDao.findToken(token);
    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid token');
    }

    const productIds = Object.keys(requestDigitalLureDto.productIds);
    let matchedProductId;
    let matchedTargetLure;

    for (const productId of productIds) {
      const targetLure =
        await this.shopifyProductsDao.findDigitalLureByProductId(productId);
      if (targetLure) {
        matchedProductId = productId;
        matchedTargetLure = targetLure;

        // imagePathは最初からS3にあるデジタルルアーの画像パスを入れる(固定値)
        // シリアルコードはデジタルルアーなので不要(適当な固定値)
        const quantity = parseInt(
          requestDigitalLureDto.productIds[matchedProductId],
          10,
        );

        for (let i = 0; i < quantity; i++) {
          const lureId = await this.lureDao.insert(
            new Lure({
              memberId: id,
              imagePathForApply: matchedTargetLure.imagePathForDigitalLure,
              imagePathForNft: matchedTargetLure.imagePathForDigitalLure,
              purchasedAt: new Date(),
              color: matchedTargetLure.color,
              serialCode: `${matchedTargetLure.color}/000`,
              lureType: LureType.MOSAIC_LURE,
            }),
          );

          console.log(`ルアーID ${i + 1}:`, lureId);
          const lure = await this.lureDao.findById(lureId);
          console.log('ルアーレコード', lure);

          const mintId = await issueDigitalLureMintId();

          await this.lureDao.updateMintIdById(lureId, mintId);
          await this.mintMasterDao.insert(
            new MintMaster({
              id: mintId,
              type: MintType.LURE,
              contentId: lureId,
            }),
          );

          this.saveReviewStatus(
            lureId,
            ReviewStatus.APPROVE,
            `${DateUtils.formatDate(
              new Date(),
            )} にデジタルルアーが登録されました。`,
          );
        }
      }
    }

    // ワンタイムトークンを削除
    return await this.oneTimeTokenDao.delete(tokenRecord.id);
  }

  private async generateSerialCode(
    lureType: LureType,
    color: string,
  ): Promise<string> {
    const latestLure = await this.lureDao.findSerialCodeByLureTypeAndColor(
      lureType,
      color,
    );
    let newSerialCode = '001';
    if (latestLure) {
      const [prefix, lastNumber] = latestLure.serialCode.split('/');
      const newNumber = (parseInt(lastNumber, 10) + 1)
        .toString()
        .padStart(3, '0');
      newSerialCode = `${prefix}/${newNumber}`;
    } else {
      newSerialCode = `${color}/001`;
    }
    return newSerialCode;
  }

  private async isLureDuplicated(
    lureType: LureType,
    memberId?: string,
    color?: string,
    serialCode?: string,
  ): Promise<boolean> {
    const lures = await this.lureDao.findByLureTypeAndSerialCode(
      lureType,
      serialCode,
    );

    const purchasingLures = await this.lureDao.findByLureTypeColorAndMemberId(
      lureType,
      color,
      memberId,
    );

    if (lures.length === 0 || purchasingLures.length === 0) {
      return false;
    }

    const lureReviewStatusList = await this.lureReviewStatusDao.selectByLureIds(
      lures.map((l) => l.id),
    );

    return (
      lureReviewStatusList.some((el) => el.status === ReviewStatus.APPROVE) ||
      purchasingLures.length !== 0
    );
  }

  private async uploadImage(fileName: string, image: string): Promise<string> {
    return await this.s3Utils.uploadBinaryData(
      decode(image.replace(/data:image\/(.+)\;base64\,/, '')),
      this.configService.get<string>('S3_IMAGE_BUCKET'),
      `lure/${fileName}`,
    );
  }

  public async saveReviewStatus(
    fishingResultId: string,
    reviewStatus: ReviewStatus,
    comment: string,
  ) {
    await this.lureReviewStatusDao.save(fishingResultId, reviewStatus, comment);
    await this.lureReviewStatusLogDao.insert(
      fishingResultId,
      reviewStatus,
      comment,
    );
  }

  private async getImagePathForNft(serialCode: string, lureType: LureType) {
    // NFT用画像の取得
    const lureImageMaster =
      await this.lureImageMasterDao.findBySerialCodeAndLureTypeAndLevel(
        serialCode,
        lureType,
        1,
      );
    if (!lureImageMaster?.fileName) {
      throw new NotFoundException('Not found lureMaster.');
    }
    return await this.s3Utils.getImagePath(
      this.configService.get<string>('S3_IMAGE_BUCKET'),
      `lure-image-master/${lureType}/${lureImageMaster.fileName}`,
    );
  }

  async admitLegendaryLure(id: string): Promise<void> {
    const lure = await this.lureDao.findById(id);
    if (lure) {
      await this.lureDao.updateLegendaryStatus(id);
    } else {
      throw new NotFoundException('Lure Not Found!');
    }
  }

  private getSerialNumber(serialCode: string): string {
    const serialCodeArray = serialCode.split('/');
    return serialCodeArray[1];
  }
}
