import { sendToken } from './send-token';

/**
 * Batch sends tokens from one or more addresses to their respective destinations.
 * @param rpcUrl - The URL of the Solana RPC endpoint.
 * @param mintPubkey - The public key of the token mint as a string.
 * @param fromSecret - Token Owner secret key.
 * @param payerSecret - The secret key of the payer account as a base58 encoded string.
 * @param inputs - An array of objects containing transfer details:
 * @param inputs[].toAddress - The destination wallet address as a string.
 * @param inputs[].decimals - The number of decimal places for the token.
 * @param inputs[].amount - The amount of tokens to transfer (before applying decimals).
 * @returns A promise that resolves to the transaction signature as a base58 encoded string.
 * @throws Will throw an error if the transaction size exceeds the maximum allowed size.
 */
export const batchSendToken = async (
  rpcUrl: string,
  mintPubkey: string,
  fromSecret: string,
  payerSecret: string,
  inputs: {
    toAddress: string;
    decimals: number;
    amount: number;
  }[],
): Promise<string> => {
  for (const input of inputs) {
    return sendToken(
      rpcUrl,
      mintPubkey,
      fromSecret,
      payerSecret,
      input.toAddress,
      input.decimals,
      input.amount,
    );
  }
};
