import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { OneTimeToken } from '~/entity/one-time-token';

@Injectable()
export class OneTimeTokenDao {
  constructor(
    @InjectRepository(OneTimeToken)
    private oneTimeTokenRepository: Repository<OneTimeToken>,
  ) {}

  public async findToken(oneTimeToken: string): Promise<OneTimeToken> {
    return await this.oneTimeTokenRepository.findOne({
      where: {
        token: oneTimeToken,
      },
    });
  }

  public async insert(entity: OneTimeToken): Promise<InsertResult> {
    return await this.oneTimeTokenRepository.insert(entity);
  }

  public async delete(id: string): Promise<void> {
    await this.oneTimeTokenRepository.delete(id);
  }
}
