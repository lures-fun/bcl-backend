import {
  Connection,
  Keypair,
  PublicKey,
  type TransactionInstruction,
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import bs from 'bs58';

const PRIORITY_FEE_LAMPORTS = 110000;
const COMMITMENT = 'confirmed';
const MAX_RETRIES = 3;
const RETRY_DELAY_SEC = 1;
const CONFIRMATION_TIMEOUT_SEC = 30000;

const calculateAmount = (amount: number, decimals: number): number => {
  return amount * 10 ** decimals;
};

/**
 * Sends tokens from one account to another on the Solana blockchain.
 * @param {string} rpcUrl - The RPC URL of the Solana network.
 * @param {string} mintPubkey - The public key of the token mint.
 * @param {string} fromSecret - The secret key of the sender's wallet.
 * @param {string} payerSecret - The secret key of the payer's wallet.
 * @param {string} toPubkey - The public key of the recipient's wallet.
 * @param {number} decimals - The number of decimal places for the token.
 * @param {number} amount - The amount of tokens to send.
 * @returns {Promise<string>} A promise that resolves to the transaction signature.
 * @throws {Error} If the transaction fails to confirm.:
 */
export const sendToken = async (
  rpcUrl: string,
  mintPubkey: string,
  fromSecret: string,
  payerSecret: string,
  toPubkey: string,
  decimals: number,
  amount: number,
): Promise<string> => {
  const connection = new Connection(rpcUrl, {
    commitment: COMMITMENT,
    confirmTransactionInitialTimeout: CONFIRMATION_TIMEOUT_SEC,
  });
  const tokenMint = new PublicKey(mintPubkey);
  const toAddress = new PublicKey(toPubkey);
  const fromWallet = Keypair.fromSecretKey(bs.decode(fromSecret));
  const payerWallet = Keypair.fromSecretKey(bs.decode(payerSecret));

  console.debug('# send token start...');

  const [fromTokenAccount, toTokenAccount] = await Promise.all([
    getAssociatedTokenAddress(
      tokenMint,
      fromWallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
    ),
    getAssociatedTokenAddress(
      tokenMint,
      toAddress,
      false,
      TOKEN_2022_PROGRAM_ID,
    ),
  ]);

  const [toAccountInfo, latestBlockhash] = await Promise.all([
    connection.getAccountInfo(toTokenAccount),
    connection.getLatestBlockhash(COMMITMENT),
  ]);

  let createRecipientAccountInst: TransactionInstruction | null = null;
  if (toAccountInfo === null) {
    createRecipientAccountInst = createAssociatedTokenAccountInstruction(
      payerWallet.publicKey,
      toTokenAccount,
      toAddress,
      tokenMint,
      TOKEN_2022_PROGRAM_ID,
    );
  }

  const addPriorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: PRIORITY_FEE_LAMPORTS,
  });

  const transferInstruction = createTransferCheckedInstruction(
    fromTokenAccount,
    tokenMint,
    toTokenAccount,
    fromWallet.publicKey,
    calculateAmount(amount, decimals),
    decimals,
    [],
    TOKEN_2022_PROGRAM_ID,
  );

  const instructions = [addPriorityFeeInstruction];
  createRecipientAccountInst && instructions.push(createRecipientAccountInst);

  const message = new TransactionMessage({
    payerKey: payerWallet.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: [...instructions, transferInstruction],
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);
  transaction.sign([fromWallet, payerWallet]);

  try {
    const signature = await connection.sendTransaction(transaction, {
      skipPreflight: true,
    });

    await connection.confirmTransaction(
      {
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      COMMITMENT,
    );
    console.debug('# successful !!: ', signature);
    return signature;
  } catch (error) {
    console.debug('# [send token] Error message: ', error.message);
    console.debug('# Retrying transaction...');
    let retryCount = 0;
    while (retryCount < MAX_RETRIES) {
      try {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_SEC * 1000),
        );

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash(COMMITMENT);
        const message = new TransactionMessage({
          payerKey: payerWallet.publicKey,
          recentBlockhash: blockhash,
          instructions: [...instructions, transferInstruction],
        }).compileToV0Message();

        const transaction = new VersionedTransaction(message);
        transaction.sign([fromWallet, payerWallet]);

        const signature = await connection.sendTransaction(transaction, {
          skipPreflight: true,
        });

        await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          COMMITMENT,
        );
        console.debug('# Retry successful !!');
        return signature;
      } catch (retryError) {
        retryCount++;
        console.debug('# Retry count: ', retryCount);
      }
    }
    throw new Error(`Retry failed after ${MAX_RETRIES}`);
  }
};
