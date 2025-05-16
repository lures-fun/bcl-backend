import { RegularNft } from '@solana-suite/regular-nft';

export const burnNft = async (mintId, walletAddress, secretKey) => {
  const inst = RegularNft.burn(mintId, walletAddress, secretKey);
  (await inst.submit()).match(
    (ok: string) => {
      console.log('# sig:', ok);
    },
    (ng: Error) => console.error(ng.message),
  );
};
