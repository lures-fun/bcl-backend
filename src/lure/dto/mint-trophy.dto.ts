import { ApiProperty } from '@nestjs/swagger';
import { LureTrophyModel } from '../model/lure-trophy.model';

export class MintTrophyResult {
  @ApiProperty()
  id: string;
  @ApiProperty()
  memberId: string;
  @ApiProperty()
  contestId: string;
  @ApiProperty()
  mintId: string;
  @ApiProperty()
  trophyTitle: string;
  @ApiProperty()
  trophyContent: string;
  @ApiProperty()
  trophyImagePath: string;
  @ApiProperty()
  contestTitle: string;
  @ApiProperty()
  contestContent: string;
  @ApiProperty()
  contestImagePath: string;
  @ApiProperty()
  field: string;
  @ApiProperty()
  trophyType: string;
  @ApiProperty()
  willBeStartAt: Date;
  @ApiProperty()
  willBeEndAt: Date;
  @ApiProperty()
  userName: string;

  constructor(param: Partial<MintTrophyResult> = {}) {
    Object.assign(this, param);
  }

  static toResponse(model: LureTrophyModel): MintTrophyResult {
    return new MintTrophyResult({
      ...model,
      trophyImagePath: model.trophyImagePath,
    });
  }
}

export class MintTrophy {
  @ApiProperty()
  summary: number;
  @ApiProperty({ type: MintTrophyResult, isArray: true })
  results: MintTrophyResult[];

  constructor(param: Partial<MintTrophy> = {}) {
    Object.assign(this, param);
  }

  static toResponse(models: LureTrophyModel[]): MintTrophy {
    return new MintTrophy({
      summary: models.length,
      results: models.map((e) => MintTrophyResult.toResponse(e)),
    });
  }
}
