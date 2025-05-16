import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenMaster, TokenType } from '~/entity/token-master.entity';

@Injectable()
export class TokenMasterDao {
  constructor(
    @InjectRepository(TokenMaster)
    private tokenMasterRepository: Repository<TokenMaster>,
  ) {}

  public async findByTokenType(tokenType: TokenType): Promise<TokenMaster> {
    return await this.tokenMasterRepository.findOne({
      where: {
        tokenType,
      },
    });
  }
}
