//////////////////////////////////////////////
// $ npx ts-node scripts/system-wallet-initialize.ts
//////////////////////////////////////////////
import { Airdrop } from '@solana-suite/airdrop';
import { Account } from '@solana-suite/utils';

const createWallet = async () => {
  const account = await Account.Keypair.create();

  await Airdrop.request(account.pubkey);

  console.log('# pubkey: ', account.pubkey);
  console.log('# secret: ', account.secret);

  return account;
};

createWallet()
  .then((res) => {
    console.log('以下を環境変数に設定');
    console.log(`SYSTEM_WALLET_ADDRESS: ${res.pubkey}`);
    console.log('以下を環境変数に設定');
    console.log(`SYSTEM_WALLET_SECRET: ${res.secret}`);
  })
  .catch((er) => {
    console.error(er);
    process.exit(-1);
  })
  .finally(async () => {
    process.exit();
  });
