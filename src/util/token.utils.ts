import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { MemberDao } from '~/dao/member.dao';
import { TokenMasterDao } from '~/dao/token-master.dao';
import { TokenTransactionDao } from '~/dao/token-transaction.dao';
import { TokenType } from '~/entity/token-master.entity';
import {
  giveTokenType,
  Status,
  TokenTransaction,
} from '~/entity/token-transaction.entity';
import { batchSendToken } from '~/solana/spl-token/batch-send-token';
import { CryptUtils } from './crypt.utils';
import { NotificationService } from '~/notification/notification.service';
import { Type } from '~/entity/notification.entity';

@Injectable()
export class TokenUtils {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly memberDao: MemberDao,
    private readonly tokenTransactionDao: TokenTransactionDao,
    private readonly tokenMasterDao: TokenMasterDao,
    private readonly cryptUtils: CryptUtils,
    private readonly notificationService: NotificationService,
  ) {}
  // トークンマスタに登録された数のトークンを付与する
  // このメソッドを呼び出す際に、呼び出し元のmodule.tsにconstructorで使用されているDAOが設定されていることを確認する
  async giveTokenFromTokenMaster(
    toMemberIds: string[],
    tokenType: TokenType,
    giveTokenType: giveTokenType,
    parentId: string = null,
    fromMemberId: string = null,
  ): Promise<number> {
    // トークンマスタから付与するトークン数を取得
    const tokenMaster = await this.tokenMasterDao.findByTokenType(tokenType);
    if (!tokenMaster) {
      throw new NotFoundException(`${tokenType}:Not found token master`);
    }
    await this.giveReadyToken(
      toMemberIds,
      tokenMaster.quantity,
      giveTokenType,
      parentId,
      fromMemberId,
    );
    return tokenMaster.quantity;
  }

  // 仮付与の処理を行う。本付与はバッチで行われる。
  async giveReadyToken(
    toMemberIds: string[],
    quantity: number,
    giveTokenType: giveTokenType,
    parentId: string = null,
    fromMemberId: string = null,
  ) {
    // トークン数が0の場合は何もしない
    if (!quantity) {
      return;
    }
    // トークンを付与したい全ユーザを取得
    const members = await this.memberDao.findAvailableByIds(toMemberIds);
    const decryptedMembers = await Promise.all(
      members.map(async (m) => {
        m.walletAddress = await this.cryptUtils.decryptText(m.walletAddress);
        return m;
      }),
    );
    for (const member of decryptedMembers) {
      await this.tokenTransactionDao.insertForSystem(
        new TokenTransaction({
          parentId: parentId,
          from: fromMemberId,
          to: member.id,
          quantity: quantity,
          status: Status.READY,
          giveTokenType: giveTokenType,
        }),
      );
    }
  }

  // 本付与する。
  async fixToken() {
    const readyTransactions = await this.tokenTransactionDao.findByStatus(
      Status.READY,
    );
    if (readyTransactions.length == 0) {
      return;
    }
    console.log(`fixToken count ${readyTransactions.length}`);
    const ids = readyTransactions.map((t) => t.id);
    await this.tokenTransactionDao.bulkUpdateStatus(ids, Status.PROCESSING);
    const transactions = await this.tokenTransactionDao.findByStatus(
      Status.PROCESSING,
    );
    for (const transaction of transactions) {
      const member = await this.memberDao.findAvailableOneById(transaction.to);
      if (!member) {
        console.log(`not found member id = ${transaction.to}`);
        continue;
      }
      try {
        const decryptedWalletAddress = await this.cryptUtils.decryptText(
          member.walletAddress,
        );
        // トークンを付与
        await this.callBatchSendToken({
          toAddress: decryptedWalletAddress,
          decimals: Number(process.env.TOKEN_DECIMALS),
          amount: transaction.quantity,
        });
        console.log(`give token finish : memberId = ${transaction.to}`);
        await this.tokenTransactionDao.updateStatus(transaction.id, Status.FIX);
        await this.notificationService.createNotification(
          Type.RECEIVE_BBT,
          null,
          transaction.to,
          transaction.id,
        );
      } catch (e) {
        console.error(
          `give token error for user ${member.userName} (ID: ${member.id}): ${e}`,
        );
        await this.tokenTransactionDao.updateStatus(
          transaction.id,
          Status.ERROR,
        );
      }
    }
  }

  // 画面から入力された数のトークンを付与する
  // このメソッドを呼び出す際に、呼び出し元のmodule.tsにconstructorで使用されているDAOが設定されていることを確認する
  async giveToken(
    toMemberIds: string[],
    quantity: number,
    giveTokenType: giveTokenType,
    parentId: string = null,
    fromMemberId: string = null,
  ) {
    // トークン数が0の場合は何もしない
    if (!quantity) {
      return;
    }
    const failedUserNames: string[] = [];
    // トークンを付与したい全ユーザを取得
    const members = await this.memberDao.findAvailableByIds(toMemberIds);
    const decryptedMembers = await Promise.all(
      members.map(async (m) => {
        m.walletAddress = await this.cryptUtils.decryptText(m.walletAddress);
        return m;
      }),
    );
    for (const member of decryptedMembers) {
      await this.entityManager.transaction(async (manager) => {
        // 同時実行させないためmemberテーブルのロックを取得
        this.memberDao.selectForUpdate(member.id, manager);
        let tokenStatus = Status.FIX;
        try {
          // トークンを付与
          await this.callBatchSendToken({
            toAddress: member.walletAddress,
            decimals: Number(process.env.TOKEN_DECIMALS),
            amount: quantity,
          });
        } catch (e) {
          console.error(
            `give token error for user ${member.userName} (ID: ${member.id}): ${e}`,
          );
          // トークン付与失敗したユーザ名を配列に追加
          failedUserNames.push(member.userName);
          tokenStatus = Status.ERROR;
        } finally {
          // トークン付与履歴をDBに登録
          await this.tokenTransactionDao.insertWithTransaction(
            new TokenTransaction({
              parentId: parentId,
              from: fromMemberId,
              to: member.id,
              quantity: quantity,
              status: tokenStatus,
              giveTokenType: giveTokenType,
            }),
            manager,
          );
        }
      });
    }
    return failedUserNames;
  }

  private async callBatchSendToken(inputs: {
    toAddress: string;
    decimals: number;
    amount: number;
  }) {
    const rpcUrl = process.env.SOLANA_RPC_URL;
    const mintPubkey = process.env.TOKEN_MINT_PUBKEY;
    const fromSecret = process.env.TOKEN_DISTRIBUTE_SECRET;
    const payerSecret = process.env.SYSTEM_WALLET_SECRET;

    await batchSendToken(rpcUrl, mintPubkey, fromSecret, payerSecret, [inputs]);
    return;
  }
}
