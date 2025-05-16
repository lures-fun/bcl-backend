import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { CompressCollectionDao } from '~/dao/compress-collection.dao';
import { ContestDao } from '~/dao/contest.dao';
import { FishingResultDao } from '~/dao/fishing-result.dao';
import { LureDao } from '~/dao/lure.dao';
import { MemberDao } from '~/dao/member.dao';
import { MerchandiseDao } from '~/dao/merchandise.dao';
import { MintMasterDao } from '~/dao/mint-master.dao';
import { TrophyDao } from '~/dao/trophy.dao';
import { CollectionType } from '~/entity/compress-collection.entity';
import { Contest } from '~/entity/contest.entity';
import { LURE_COLOR, LureType } from '~/entity/lure.entity';
import { Member } from '~/entity/member.entity';
import { Merchandise } from '~/entity/merchandise.entity';
import { MintMaster, MintType } from '~/entity/mint-master.entity';
import { Trophy } from '~/entity/trophy.entity';
import { FishingResultDetailModel } from '~/fishing-result/model/fishing-result-detail-model';
import { NotificationService } from '~/notification/notification.service';
import { CryptUtils } from '~/util/crypt.utils';
import {
  WHITE_LIST_VIDEO_EXTENSIONS,
  getExtensionFromURL,
} from '~/util/file.utils';
import { issueCompressNft } from '~/util/mint.utils';
import { S3Utils } from '~/util/s3.utils';
import { TokenUtils } from '~/util/token.utils';

@Injectable()
export class BatchService {
  constructor(
    private readonly trophyDao: TrophyDao,
    private readonly contestDao: ContestDao,
    private readonly memberDao: MemberDao,
    private readonly compressCollectionDao: CompressCollectionDao,
    private readonly fishingResultDao: FishingResultDao,
    private readonly mintMasterDao: MintMasterDao,
    private readonly merchandiseDao: MerchandiseDao,
    private readonly lureDao: LureDao,
    private readonly configService: ConfigService,
    private readonly s3Utils: S3Utils,
    private readonly cryptUtils: CryptUtils,
    private readonly tokenUtils: TokenUtils,
    private readonly notificationService: NotificationService,
  ) {}

  /** 例外を握りつぶしてログだけ残す共通ラッパー */
  private async safeRun(label: string, fn: () => Promise<void>) {
    try {
      await fn();
    } catch (err) {
      console.error(`Batch processing failed for ${label}:`, err);
      // ★ 再 throw しない
    }
  }

  // 毎日12時 18時に実行
  // @Cron('0 12,18 * * *')
  // テスト時 1時間おきに実行
  @Cron('0 * * * *')
  async executeBatchForMintCollection() {
    let collections;
    try {
      console.log('[MintCollection] batch started');
      collections = await this.compressCollectionDao.findBatchStatus(true);

      if (collections.length === 0) {
        console.log('[MintCollection] no target collections');
        return;
      }
    } catch (e) {
      console.error('[MintCollection] preparation failed:', e);
      return;
    }

    for (const c of collections) {
      await this.safeRun(`collection ${c.mintCollection}`, async () => {
        console.log(`[MintCollection] processing ${c.mintCollection}`);

        switch (c.collectionType) {
          case CollectionType.FISHINGRESULTS:
            await this.mintFishingResults();
            break;
          case CollectionType.BCL_LURE:
            await this.mintLures();
            break;
          case CollectionType.TITLE:
            await this.mintTrophies();
            break;
          case CollectionType.MERCHANDISES:
            await this.mintMerchandises();
            break;
          default:
            console.warn(`[MintCollection] unknown type: ${c.collectionType}`);
        }
      });
    }
  }
  // デジタルルアーの mint は 10分おきに実行
  @Cron('0 */10 * * * *')
  async executeBatchForMintDigitalLure() {
    try {
      console.log('Start batch processing for mint digital lure.');
      const digitalLureCollection =
        await this.compressCollectionDao.findTreeOwner(
          CollectionType.DIGITAL_LURE,
        );

      // デジタルルアーの isMintbatchEnabled が false の場合は処理をスキップ
      if (!digitalLureCollection || !digitalLureCollection.isMintbatchEnabled) {
        return;
      }

      const digitalLures = await this.lureDao.findDigitalLuresToMint();

      if (digitalLures.length === 0) {
        return;
      }

      for (const digitalLure of digitalLures) {
        console.log(`Processing digital lure: ${digitalLure.id}`);
        await this.issueNftForLure(digitalLure.id);
      }
    } catch (e) {
      console.error('Batch processing failed:', e);
      throw new InternalServerErrorException(
        'Batch processing failed. Please try again later.',
      );
    }
  }

  // トークン付与の確定は3分おきに実行
  @Cron('0 */3 * * * *')
  async executeBatchForFixToken() {
    await this.tokenUtils.fixToken();
  }

  // SendNotification is executed every 3 seconds
  @Cron('*/3 * * * * *')
  async executeBatchForSendNotification() {
    await this.notificationService.sendPushNotifications();
  }

  async mintFishingResults() {
    const fishingResults =
      await this.fishingResultDao.findFisingResultsToMint();

    if (fishingResults.length > 0) {
      for (const fishingResult of fishingResults) {
        await this.issueNftForFishingResult(fishingResult);
        console.log(
          `Minted fishingResult with mintId: ${fishingResult.mintId}`,
        );
      }
    } else {
      console.log('No fishingResult to mint.');
    }
  }

  async mintLures() {
    const lures = await this.lureDao.findLuresToMint();
    if (lures.length > 0) {
      for (const lure of lures) {
        await this.issueNftForLure(lure.id);
        console.log(`Minted Lure with mintId: ${lure.mintId}`);
      }
    } else {
      console.log('No Lure to mint.');
    }
  }

  async mintTrophies() {
    const trophies = await this.trophyDao.findTrophiesToMint();
    if (trophies.length > 0) {
      for (const trophy of trophies) {
        let fishingResult: FishingResultDetailModel;
        if (trophy.fishingResultId) {
          fishingResult = await this.fishingResultDao.findByIdWithMaster(
            trophy.fishingResultId,
          );
          if (!fishingResult || !fishingResult.mintId) {
            throw new NotFoundException('not found fishingResult');
          }
        }
        const member = await this.memberDao.findAvailableOneById(
          trophy.memberId,
        );
        if (!member) {
          throw new NotFoundException('not found member');
        }

        let contest: Contest;
        if (trophy.contestId) {
          contest = await this.contestDao.findOneById(trophy.contestId);
          if (!contest) {
            throw new NotFoundException('not found contest');
          }
        }

        const extension = getExtensionFromURL(trophy.imagePath);
        const fileName = `${trophy.id}.${extension}`;

        await this.issueNftForTrophy(trophy, member, fileName, fishingResult);
        console.log(`Minted trophy with mintId: ${trophy.mintId}`);
      }
    } else {
      console.log('No trophies to mint.');
    }
  }

  async mintMerchandises() {
    const merchandises = await this.merchandiseDao.findMerchandiseToMint();
    if (merchandises.length > 0) {
      for (const merchandise of merchandises) {
        const member = await this.memberDao.findAvailableOneById(
          merchandise.memberId,
        );
        if (!member) {
          throw new NotFoundException('not found member');
        }

        const extension = getExtensionFromURL(merchandise.imagePath);
        const fileName = `${merchandise.id}.${extension}`;

        await this.issueNftForMerchandise(merchandise, member, fileName);
        console.log(`Minted Merchandise with mintId: ${merchandise.mintId}`);
      }
    } else {
      console.log('No Merchandise to mint.');
    }
  }

  private async issueNftForFishingResult(
    fishingResult: FishingResultDetailModel,
  ): Promise<void> {
    const fishingResultWithMaster =
      await this.fishingResultDao.findByIdWithMaster(fishingResult.id);

    console.log('fishingResultWithMaster', fishingResultWithMaster);

    const BASE_PATH = 'fishing-result';
    const IMAGE_PATH_PREFIX_FOR_NFT = `${BASE_PATH}/nft`;
    // NFT用のパスが動画の場合は、代わりに申請用画像を使ってmint
    const ALTER_PATH_PREFIX_FOR_NFT = `${BASE_PATH}/apply`;

    const initialParts = fishingResultWithMaster.imagePathForNft.split('/');
    const initialFileName = initialParts[initialParts.length - 1];
    const fileExtension = initialFileName.split('.').pop()?.toLowerCase();
    const isVideo = WHITE_LIST_VIDEO_EXTENSIONS.includes(fileExtension);

    // 動画かどうかで使用するパスを選択
    const imagePath = isVideo
      ? fishingResultWithMaster.imagePathForApply
      : fishingResultWithMaster.imagePathForNft;

    const parts = imagePath.split('/');

    const fileName = parts[parts.length - 1];

    const PATH_PREFIX_FOR_NFT = isVideo
      ? ALTER_PATH_PREFIX_FOR_NFT
      : IMAGE_PATH_PREFIX_FOR_NFT;

    const bucket = `${this.configService.get<string>(
      'S3_IMAGE_BUCKET',
    )}/${PATH_PREFIX_FOR_NFT}`;

    console.log('bucket', bucket);
    console.log('fileName', fileName);

    const binary = await this.s3Utils.downloadBinary(bucket, fileName);

    const ownerSecret = this.configService.get<string>('SYSTEM_WALLET_SECRET');
    const treeOwnerKey = CollectionType.FISHINGRESULTS;

    if (!treeOwnerKey) {
      throw new NotFoundException(
        'CollectionType FISHINGRESULTS not found for treeOwnerKey',
      );
    }

    const compCollection = await this.compressCollectionDao.findTreeOwner(
      treeOwnerKey,
    );

    if (!compCollection) {
      throw new NotFoundException(
        'MintCollection not found for FishingResults',
      );
    }

    let mintId = fishingResultWithMaster.mintId;

    const member = await this.memberDao.findAvailableOneById(
      fishingResultWithMaster.memberId,
    );

    try {
      mintId = await issueCompressNft(
        binary,
        fileName,
        `${fishingResultWithMaster.title}`,
        fishingResultWithMaster.comment,
        ownerSecret,
        [
          { trait_type: 'field', value: fishingResultWithMaster.fieldName },
          { trait_type: 'rod', value: fishingResultWithMaster.rodName },
          { trait_type: 'line', value: fishingResultWithMaster.lineName },
          { trait_type: 'reel', value: fishingResultWithMaster.reelName },
          {
            trait_type: 'lure',
            value: fishingResultWithMaster.lureName,
          },
          {
            trait_type: 'size',
            value: fishingResultWithMaster.size.toString(),
          },
          {
            trait_type: 'caughtAt',
            value: fishingResultWithMaster.caughtAt.toDateString(),
          },
        ],
        compCollection.treeOwner,
        compCollection.mintCollection,
        await this.cryptUtils.decryptText(member.walletAddress),
      );
    } catch (e) {
      console.error(
        `NFT発行でエラーが発生しました。fishingResultId: "${fishingResultWithMaster.id}"`,
      );
      throw new InternalServerErrorException(
        'Mintに失敗しました。時間をおいて再チャレンジしてください。',
      );
    }

    try {
      await this.fishingResultDao.updateMintIdById(
        fishingResultWithMaster.id,
        mintId,
      );
      await this.mintMasterDao.delete(fishingResultWithMaster.id);
      await this.mintMasterDao.insert(
        new MintMaster({
          id: mintId,
          type: MintType.FISHING_RESULT,
          contentId: fishingResultWithMaster.id,
        }),
      );
    } catch (e) {
      console.error(
        `NFT発行後のDB紐付けでエラーが発生しました。mintId:"${mintId}" fishingResultId: "${fishingResultWithMaster.id}"`,
      );
      throw e;
    }
  }

  private async issueNftForLure(id: string): Promise<void> {
    const lure = await this.lureDao.findById(id);

    const imageNameForNft = lure.imagePathForNft.split('/').pop();

    console.log('lure', lure);
    console.log('imageNameForNft', imageNameForNft);
    console.log(
      'config service',
      this.configService.get<string>('S3_IMAGE_BUCKET'),
    );

    // `level` パスがある場合とない場合でキーを構築
    const levelPath = lure.imagePathForNft.includes('/level/')
      ? `/level/${lure.imagePathForNft.split('/level/')[1].split('/')[0]}`
      : '';

    const key = `lure-image-master/${lure.lureType}/${
      levelPath ? levelPath + '/' : ''
    }${imageNameForNft}`;
    console.log('key', key);

    const binary = await this.s3Utils.downloadBinary(
      `${this.configService.get<string>('S3_IMAGE_BUCKET')}`,
      key,
    );

    console.log('binary', binary);

    const ownerSecret = this.configService.get<string>('SYSTEM_WALLET_SECRET');
    // BCLで発売している lure の場合は BCL_LURE 一般発売の lure の場合は GENERAL_LURE
    const treeOwnerKey = CollectionType.BCL_LURE;

    if (!treeOwnerKey) {
      throw new NotFoundException(
        'CollectionType BCL_LURE not found for treeOwnerKey',
      );
    }

    const compCollection = await this.compressCollectionDao.findTreeOwner(
      treeOwnerKey,
    );

    if (!compCollection) {
      throw new NotFoundException('MintCollection not found for Lure');
    }

    let mintId = lure.mintId;
    let prefix: string;
    if (lure.lureType === LureType.W3_CRANKBAIT) {
      prefix = 'W';
    } else if (lure.lureType === LureType.DRAFT_WAKER) {
      prefix = 'D';
    } else if (lure.lureType === LureType.HYOUSOU_BAKA_ICHIDAI) {
      prefix = 'H';
    } else if (lure.lureType === LureType.BALAM_300_YUKI) {
      prefix = 'B3';
    } else if (lure.lureType === LureType.VARIANT_255_YUKI) {
      prefix = 'V2';
    } else if (lure.lureType === LureType.RANKAKU_80) {
      prefix = 'R8';
    } else if (lure.lureType === LureType.TAPPEI_BNSP) {
      prefix = 'TB';
    } else if (lure.lureType === LureType.LC_MTO15) {
      prefix = 'LC';
    } else if (lure.lureType === LureType.HMKL_SUPER_JORDAN_68) {
      prefix = 'HS';
    } else if (lure.lureType === LureType.N_SHAD) {
      prefix = 'NS';
    } else if (lure.lureType === LureType.MOSAIC_LURE) {
      prefix = 'DL';
    } else if (lure.lureType === LureType.SCREW_WAKATARO) {
      prefix = 'SW';
    } else if (lure.lureType === LureType.BOXER) {
      prefix = 'B';
    } else if (lure.lureType === LureType.VOLBEAT70F) {
      prefix = 'V7F';
    } else if (lure.lureType === LureType.VOLBEAT70S) {
      prefix = 'V7S';
    } else if (lure.lureType === LureType.DOT_SIX) {
      prefix = 'DS';
    } else if (
      lure.lureType === LureType.COIKE &&
      lure.color === LURE_COLOR.COIKE.SMOKER_BG_F
    ) {
      prefix = 'CSM';
    } else if (
      lure.lureType === LureType.COIKE &&
      lure.color === LURE_COLOR.COIKE.CLEAR_ORANGE_PGG_F
    ) {
      prefix = 'CCO';
    } else if (
      lure.lureType === LureType.COIKE &&
      lure.color === LURE_COLOR.COIKE.SPG
    ) {
      prefix = 'CSPG';
    } else if (
      lure.lureType === LureType.COIKE &&
      lure.color === LURE_COLOR.COIKE.EDGE_SHRIMP
    ) {
      prefix = 'CES';
    } else if (lure.lureType === LureType.COIKE) {
      prefix = 'C';
    }

    const member = await this.memberDao.findAvailableOneById(lure.memberId);

    try {
      mintId = await issueCompressNft(
        binary,
        imageNameForNft,
        `${prefix}${lure.serialCode}`,
        '',
        ownerSecret,
        [
          { trait_type: 'type', value: lure.lureType },
          {
            trait_type: 'purchasedAt',
            value: lure.purchasedAt.toDateString(),
          },
        ],
        compCollection.treeOwner,
        compCollection.mintCollection,
        await this.cryptUtils.decryptText(member.walletAddress),
      );
    } catch (e) {
      console.error(`NFT発行でエラーが発生しました。lureId: "${lure.id}"`);
      throw new InternalServerErrorException(
        'Mintに失敗しました。時間をおいて再チャレンジしてください。',
      );
    }
    try {
      await this.lureDao.updateMintIdById(id, mintId);
      await this.mintMasterDao.delete(lure.id);
      await this.mintMasterDao.insert(
        new MintMaster({
          id: mintId,
          type: MintType.LURE,
          contentId: id,
        }),
      );
    } catch (e) {
      console.error(
        `NFT発行後のDB紐付けでエラーが発生しました。mintId:"${mintId}" lureId: "${id}"`,
      );
      throw e;
    }
  }

  private async issueNftForTrophy(
    trophy: Trophy,
    member: Member,
    fileName: string,
    fishingResult?: FishingResultDetailModel,
  ) {
    const imageNameForNft = trophy.imagePath.split('/').pop();

    const binary = await this.s3Utils.downloadBinary(
      `${this.configService.get<string>('S3_IMAGE_BUCKET')}`,
      `trophy/${fileName}`,
    );

    const ownerSecret = this.configService.get<string>('SYSTEM_WALLET_SECRET');

    const treeOwnerKey = CollectionType.TITLE;

    if (!treeOwnerKey) {
      throw new NotFoundException(
        'CollectionType TITLE not found for treeOwnerKey',
      );
    }

    const compCollection = await this.compressCollectionDao.findTreeOwner(
      treeOwnerKey,
    );

    if (!compCollection) {
      throw new NotFoundException('MintCollection not found for Trophy');
    }

    let mintId: string;

    let attributes;
    if (fishingResult) {
      attributes = [
        { trait_type: 'field', value: fishingResult.fieldName },
        { trait_type: 'rod', value: fishingResult.rodName },
        { trait_type: 'line', value: fishingResult.lineName },
        { trait_type: 'reel', value: fishingResult.reelName },
        {
          trait_type: 'lure',
          value: fishingResult.lureName,
        },
        { trait_type: 'size', value: fishingResult.size.toString() },
        {
          trait_type: 'caughtAt',
          value: fishingResult.caughtAt.toDateString(),
        },
      ];
    }
    try {
      mintId = await issueCompressNft(
        binary,
        imageNameForNft,
        `${trophy.title}`,
        `${trophy.content}`,
        ownerSecret,
        attributes,
        compCollection.treeOwner,
        compCollection.mintCollection,
        await this.cryptUtils.decryptText(member.walletAddress),
      );
      trophy.mintId = mintId;
    } catch (e) {
      console.error(`NFT発行でエラーが発生しました。trophyId: "${trophy.id}"`);
      throw new InternalServerErrorException(
        'Mintに失敗しました。時間をおいて再チャレンジしてください。',
      );
    }

    try {
      await this.mintMasterDao.delete(trophy.id);
      await this.mintMasterDao.insert(
        new MintMaster({
          id: trophy.mintId,
          type: MintType.TITLE,
          contentId: trophy.id,
        }),
      );
      return await this.trophyDao.save(trophy);
    } catch (e) {
      // エラー時は手動でデータ改修
      console.error(
        `NFT発行後のDB紐付けでエラーが発生しました。mintId:"${trophy.mintId}" trophyId: "${trophy.id}"`,
      );
      throw e;
    }
  }

  private async issueNftForMerchandise(
    merchandise: Merchandise,
    member: Member,
    fileName: string,
  ): Promise<Merchandise> {
    const imageNameForNft = merchandise.imagePath.split('/').pop();
    const binary = await this.s3Utils.downloadBinary(
      `${this.configService.get<string>('S3_IMAGE_BUCKET')}`,
      `merchandise/${fileName}`,
    );
    const ownerSecret = this.configService.get<string>('SYSTEM_WALLET_SECRET');
    const treeOwnerKey = CollectionType.MERCHANDISES;

    if (!treeOwnerKey) {
      throw new NotFoundException(
        'CollectionType MERCHANDISES not found for treeOwnerKey',
      );
    }

    const compCollection = await this.compressCollectionDao.findTreeOwner(
      treeOwnerKey,
    );

    if (!compCollection) {
      throw new NotFoundException('MintCollection not found for Merchandise');
    }

    let mintId: string;
    try {
      mintId = await issueCompressNft(
        binary,
        imageNameForNft,
        `${merchandise.title}`,
        `${merchandise.content}`,
        ownerSecret,
        [],
        compCollection.treeOwner,
        compCollection.mintCollection,
        await this.cryptUtils.decryptText(member.walletAddress),
      );
    } catch (e) {
      console.error(
        `NFT発行でエラーが発生しました。merchandiseId: "${merchandise.id}"`,
      );
      throw new InternalServerErrorException(
        'Mintに失敗しました。時間をおいて再チャレンジしてください。',
      );
    }

    merchandise.mintId = mintId;

    try {
      await this.mintMasterDao.delete(merchandise.id);
      await this.mintMasterDao.insert(
        new MintMaster({
          id: merchandise.mintId,
          type: MintType.MERCHANDISE,
          contentId: merchandise.id,
        }),
      );
      return await this.merchandiseDao.save(merchandise);
    } catch (e) {
      // エラー時は手動でデータ改修
      console.error(
        `NFT発行後のDB紐付けでエラーが発生しました。mintId:"${merchandise.mintId}" merchandiseId: "${merchandise.id}"`,
      );
      throw e;
    }
  }
}
