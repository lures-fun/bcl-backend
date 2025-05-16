import { RegularNft } from '@solana-suite/regular-nft';

export const transferNft = async (
  mintId: string,
  ownerWalletAddress: string,
  recieptWalletAddress: string,
  ownerSecret: string,
) => {
  console.log('#transfer started');

  const inst = await RegularNft.transfer(
    mintId,
    ownerWalletAddress,
    recieptWalletAddress,
    [ownerSecret],
  );

  (
    await inst.submit({ isPriorityFee: true, addSolPriorityFee: 0.00018 })
  ).match(
    (value) => console.log('# sig: ', value),
    (error) => {
      console.error(error);
      throw error;
    },
  );
  return { message: 'transfer completed' };
};
