import { CompressedNft } from '@solana-suite/compressed-nft';
import { Node } from '@solana-suite/utils';

export const createCollection = async (
  ownerSecretKey: string,
  file: any,
  name: string,
  symbol: string,
): Promise<string> => {
  const collectionInst = await CompressedNft.mintCollection(
    ownerSecretKey,
    {
      filePath: file,
      name,
      symbol,
      royalty: 0,
      storageType: 'filebase',
      isMutable: true,
    },
    {
      feePayer: ownerSecretKey,
    },
  );

  (await collectionInst.submit()).match(
    async (value) => {
      await Node.confirmedSig(value);
    },
    (error) => console.error(error),
  );

  const mintCollection = collectionInst.unwrap().data;
  console.log('# mintCollection: ', mintCollection);
  return mintCollection;
};
