import { v4 as uuidv4 } from 'uuid';
import { compressMint } from '~/solana/cnft/compress-mint';
import { Attributes, attributeMint } from '~/solana/nft/attribute-mint-nft';
import { deleteFileFromTemporary, saveFileToTemporary } from './file.utils';

/**
 *
 * @param buffer 画像データ
 * @param fileName 必須:ファイル名
 * @param name 必須:NFTに登録する名前
 * @param description 非必須:NFTに登録する概要
 * @param ownerSecretKey 必須 シークレット
 * @param attributes その他属性
 * @returns mintId
 */
export const issueNft = async (
  buffer: Buffer,
  fileName: string,
  name: string,
  description: string,
  ownerSecretKey: string,
  attributes: Attributes,
): Promise<string> => {
  try {
    const filePath = saveFileToTemporary(buffer, fileName);

    return await attributeMint(
      filePath,
      name,
      description,
      ownerSecretKey,
      attributes,
    );
  } catch (e) {
    console.error('Grant nft occurented error.', e);
    throw e;
  } finally {
    deleteFileFromTemporary(fileName);
  }
};

/**
 *
 * @param buffer 画像データ
 * @param fileName 必須:ファイル名
 * @param name 必須:NFTに登録する名前
 * @param description 非必須:NFTに登録する概要
 * @param ownerSecretKey 必須 シークレット
 * @param attributes その他属性
 * @param treeOwner 必須: スペースを生成するオーナーアドレス
 * @param mintCollection 必須: Collection NFTのアドレス
 * @param walletAddress 必須: NFTを受け取るウォレットアドレス
 * @returns mintId
 */
export const issueCompressNft = async (
  buffer: Buffer,
  fileName: string,
  name: string,
  description: string,
  ownerSecretKey: string,
  attributes: Attributes,
  treeOwner: string,
  mintCollection: string,
  nftReceiver?: string,
): Promise<string> => {
  try {
    const filePath = saveFileToTemporary(buffer, fileName);

    return await compressMint(
      ownerSecretKey,
      filePath,
      name,
      description,
      attributes,
      treeOwner,
      mintCollection,
      nftReceiver,
    );
  } catch (e) {
    console.error('Grant nft occurented error.', e);
    throw e;
  } finally {
    deleteFileFromTemporary(fileName);
  }
};

export const issueDummyMintId = async (): Promise<string> => {
  return 'dmint-' + uuidv4();
};

export const issueDigitalLureMintId = async (): Promise<string> => {
  return 'dluremint-' + uuidv4();
};
