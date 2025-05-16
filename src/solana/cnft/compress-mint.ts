import { CompressedNft } from '@solana-suite/compressed-nft';
import { Explorer } from '@solana-suite/utils';

type Attribute = {
  trait_type: string;
  value: string;
};

export type Attributes = Attribute[];

export const compressMint = async (
  ownerSecretKey: string,
  file: any,
  name: string,
  description: string,
  attributes: Attributes,
  treeOwner: string,
  mintCollection: string,
  nftReceiver: string,
): Promise<string> => {
  const mintInst = await CompressedNft.mint(
    ownerSecretKey,
    {
      filePath: file,
      name,
      symbol: 'BCL',
      description,
      royalty: 0,
      attributes,
      storageType: 'filebase',
      isMutable: true,
      external_url: 'https://www.blockchain-lures.com/',
    },
    treeOwner,
    mintCollection,
    {
      // 受け取りアドレスを指定
      receiver: nftReceiver,
      feePayer: ownerSecretKey,
    },
  );

  const res = (
    await mintInst.submit({ isPriorityFee: true, addSolPriorityFee: 0.00002 })
  ).map(
    async (value) => value,
    (ng: Error) => {
      console.error(ng.message);
      throw ng;
    },
  );

  const sig = await res.unwrap();
  console.log('# sig: ', sig.toExplorerUrl(Explorer.Xray));
  const mint = (await CompressedNft.findMintIdBySignature(sig)).unwrap();
  console.log('# mint: ', mint);

  return mint;
};
