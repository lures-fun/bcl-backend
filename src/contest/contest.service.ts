import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contest } from '~/entity/contest.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContestService {
  constructor(
    @InjectRepository(Contest) private contestRepository: Repository<Contest>,
  ) {}

  // MEMO: typeorm設定時の動作確認用に作成したmethod. 今後の実装の参考になるかもなのでいったん残す
  // TODO: コンテストの本処理時にこのコメント、直前のコメントを削除すること（不要であればこのメソッドも削除
  async getAllContests(): Promise<[Contest[], number]> {
    return await this.contestRepository.findAndCount().catch((e) => {
      throw new InternalServerErrorException(e.message);
    });
  }
}
