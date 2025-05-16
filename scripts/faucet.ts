//////////////////////////////////////////////
// $ npx ts-node scripts/solana/faucet.ts <WALLET_ADDRESS>
//////////////////////////////////////////////
import { Airdrop } from '@solana-suite/airdrop';

const addSol = async (walletAddress: string): Promise<string> => {
  try {
    await Airdrop.request(walletAddress);
    return `Successfully added SOL to ${walletAddress}.`;
  } catch (error) {
    console.error(
      `Error while trying to airdrop SOL to ${walletAddress}:`,
      error,
    );
    return `Failed to add SOL to ${walletAddress}. Check the logs for details.`;
  }
};

(async () => {
  const walletAddress = process.argv[2];

  if (!walletAddress) {
    console.error('Please provide a wallet address as an argument.');
    process.exit(1);
  }

  const result = await addSol(walletAddress);
  console.log(result);
})();
