//////////////////////////////////////////////
// $ npx ts-node create-spl-token.ts <totalAmount> <decimals> <ownerWalletAddress> <ownerSecretKey> <file-path>
//////////////////////////////////////////////
import { SplToken } from '@solana-suite/spl-token';
import { Pubkey } from '@solana-suite/utils';

const createSplToken = async (
  totalAmount,
  decimals,
  ownerWalletAddress,
  ownerSecretKey,
  file,
) => {
  const tokenMetadata = {
    name: 'BCL Token',
    symbol: 'BCL',
    royalty: 0,
    filePath: file,
    storageType: 'filebase',
    isMutable: false,
  };

  const inst1 = await SplToken.mint(
    ownerSecretKey,
    totalAmount,
    decimals,
    tokenMetadata,
  );

  const mint = inst1.unwrap().data as Pubkey;

  console.log('# Mint sig: ', inst1);
  console.log('# Mint sig: ', inst1.unwrap());
  console.log('# Mint sig: ', mint);

  return mint;
};

(async () => {
  const [, , totalAmount, decimals, ownerWalletAddress, ownerSecretKey, file] =
    process.argv;

  if (
    !totalAmount ||
    !decimals ||
    !ownerWalletAddress ||
    !ownerSecretKey ||
    !file
  ) {
    console.error('Please provide all necessary arguments.');
    process.exit(1);
  }

  await createSplToken(
    totalAmount,
    parseInt(decimals),
    ownerWalletAddress,
    ownerSecretKey,
    file,
  );
})();
