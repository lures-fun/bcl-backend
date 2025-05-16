import { InternalServerErrorException } from '@nestjs/common';
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import * as nacl from 'tweetnacl';

/**
 * 受け取った serializedTransaction（Base64エンコードされた文字列）と clientBlockhash を使って、
 * トランザクションに署名し、Solana のネットワークに送信する
 *
 * @param data { transaction: string, blockhash: string }
 * @returns 成功時は { success: true, message: トランザクション署名 } を返す
 * @throws InternalServerErrorException エラー発生時
 */
export const realTimeSendToken = async (data: {
  transaction: string;
  feePayerSecret: string;
  rpcUrl: string;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log('# [send token] data:', data);
    const { transaction: serializedTransaction } = data;

    const transaction = VersionedTransaction.deserialize(
      Buffer.from(serializedTransaction, 'base64'),
    );

    const messageToVerify = transaction.message.serialize();

    const feePayerKeypair = Keypair.fromSecretKey(
      bs58.decode(data.feePayerSecret),
    );

    const extraSignature = nacl.sign.detached(
      messageToVerify,
      feePayerKeypair.secretKey,
    );

    transaction.addSignature(
      feePayerKeypair.publicKey,
      Buffer.from(extraSignature),
    );

    const connection = new Connection(data.rpcUrl);

    const sig = await connection.sendTransaction(transaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    console.log('# transaction signature:', sig);
    return { success: true, message: sig };
  } catch (error) {
    console.error('# [send token] Error: ', error);
    throw new InternalServerErrorException('Error processing request');
  }
};
