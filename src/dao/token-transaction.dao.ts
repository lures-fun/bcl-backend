import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Status, TokenTransaction } from '~/entity/token-transaction.entity';
import { DateUtils } from '~/util/date.utils';

@Injectable()
export class TokenTransactionDao {
  constructor(
    @InjectRepository(TokenTransaction)
    private tokenTransactionRepository: Repository<TokenTransaction>,
  ) {}

  async updateStatus(id: string, status: Status): Promise<void> {
    await this.tokenTransactionRepository.update(
      { id },
      { status, updatedAt: DateUtils.now() },
    );
  }

  // システムからの付与時以外は利用してはいけません（トランザクションなしの際に使用）
  async insertForSystem(entity: TokenTransaction): Promise<void> {
    entity.from = null;
    // システムから付与されるトークンのfromはnull
    await this.tokenTransactionRepository.insert(entity);
  }

  // トークン付与時に使用（トランザクションありの際に使用）
  async insertWithTransaction(
    entity: TokenTransaction,
    manager: EntityManager,
  ): Promise<void> {
    await manager.getRepository(TokenTransaction).insert(entity);
  }

  async findByIdAndStatus(
    id: string,
    status: Status,
  ): Promise<TokenTransaction> {
    return await this.tokenTransactionRepository.findOneBy({ id, status });
  }

  async findByStatus(status: Status): Promise<TokenTransaction[]> {
    return await this.tokenTransactionRepository.findBy({ status });
  }

  async bulkUpdateStatus(ids: string[], status: Status): Promise<void> {
    await this.tokenTransactionRepository.update({ id: In(ids) }, { status });
  }

  /**
   * 該当memberの利用可能トークン数を返却します
   */
  async findAvailableTokenCount(memberId: string): Promise<number> {
    const countOfTokensSent = (
      await this.tokenTransactionRepository.findBy({
        from: memberId,
        status: In([Status.READY, Status.FIX]),
      })
    ).reduce((total, tokenTransaction) => total + tokenTransaction.quantity, 0);

    const countOfTokensReceived = (
      await this.tokenTransactionRepository.findBy({
        to: memberId,
        status: Status.FIX,
      })
    ).reduce((total, tokenTransaction) => total + tokenTransaction.quantity, 0);

    return countOfTokensReceived - countOfTokensSent;
  }
}
