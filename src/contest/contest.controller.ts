import { Controller, Get } from '@nestjs/common';

import { ApiOperation } from '@nestjs/swagger';
import { Contest } from '~/entity/contest.entity';
import { ContestService } from './contest.service';

// MEMO: typeorm設定時の動作確認用に作成したController. 今後の実装の参考になるかもなのでいったん残す
// TODO: コンテストの本処理時にこのコメント、直前のコメントを削除すること
@Controller('contests')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @ApiOperation({ deprecated: true })
  @Get()
  async getAllContests(): Promise<[Contest[], number]> {
    const res = await this.contestService.getAllContests();
    return res;
  }
}
