import { RegularNft } from '@solana-suite/regular-nft';
import { Pubkey, Node } from '@solana-suite/utils';

type Attribute = {
  trait_type: string;
  value: string;
};

export type Attributes = Attribute[];

export const attributeMint = async (
  filePath: string,
  name: string,
  description: string,
  ownerSecretKey: string,
  attributes: Attributes,
): Promise<Pubkey> => {
  try {
    const inst = await RegularNft.mint(ownerSecretKey, {
      filePath,
      storageType: 'filebase',
      name,
      symbol: 'BCL',
      description,
      royalty: 0,
      attributes,
      isMutable: true,
      external_url: 'https://www.blockchain-lures.com/',
    });

    const res = await inst.submit({
      isPriorityFee: true,
      addSolPriorityFee: 0.00018,
    });

    console.log('res', res.unwrap());

    await Node.confirmedSig(res.unwrap());

    console.log('#mint ended');

    return (await inst.unwrap().data) as Pubkey;
  } catch (error) {
    console.error('An error occurred during the minting process:', error);
    throw new Error('Failed to mint NFT: ' + error.message);
  }
};
