import { CompressedNft } from '@solana-suite/compressed-nft';
import { Node } from '@solana-suite/utils';

export const createSpace = async (
  secretKey: string,
  abountMintTotal: any,
): Promise<string> => {
  const spaceInst = await CompressedNft.createSpace(
    secretKey,
    abountMintTotal,
    {
      feePayer: secretKey,
    },
  );
  const spaceOwner = spaceInst.unwrap().data;
  console.log('# spaceInst: ', spaceInst);
  console.log('# spaceOwner: ', spaceOwner);

  (await spaceInst.submit()).match(
    async (value) => {
      await Node.confirmedSig(value);
    },
    (error) => {
      console.error(error);
    },
  );

  const treeOwner = spaceInst.unwrap().data;
  console.log('# treeOwner: ', treeOwner);

  return treeOwner;
};
