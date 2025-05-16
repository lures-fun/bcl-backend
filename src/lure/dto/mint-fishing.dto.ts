import { ApiProperty } from '@nestjs/swagger';
import { FishingResultModel } from '../model/fishing-result.model';

export class MintFishingResult {
  @ApiProperty()
  id: string;
  @ApiProperty()
  memberId: string;
  @ApiProperty()
  userName: string;
  @ApiProperty()
  mintId: string;
  @ApiProperty()
  field: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  size: number;
  @ApiProperty()
  fishType: string;
  @ApiProperty()
  lureId: string;
  @ApiProperty()
  rod: string;
  @ApiProperty()
  line: string;
  @ApiProperty()
  reel: string;
  @ApiProperty()
  imagePathForApply: string;
  @ApiProperty()
  imagePathForNft: string;
  @ApiProperty()
  comment: string;
  @ApiProperty()
  caughtAt: Date;

  constructor(param: Partial<MintFishingResult> = {}) {
    Object.assign(this, param);
  }

  static toResponse(model: FishingResultModel): MintFishingResult {
    return new MintFishingResult({
      id: model.id,
      memberId: model.memberId,
      userName: model.userName,
      mintId: model.mintId,
      field: model.field,
      title: model.title,
      size: model.size,
      fishType: model.fishType,
      lureId: model.lureId,
      rod: model.rod,
      line: model.line,
      reel: model.reel,
      imagePathForApply: model.imagePathForApply,
      imagePathForNft: model.imagePathForNft,
      comment: model.comment,
      caughtAt: model.caughtAt,
    });
  }
}

export class MintFishingDto {
  @ApiProperty()
  summary: number;
  @ApiProperty({ type: MintFishingResult })
  results: MintFishingResult[];

  constructor(param: Partial<MintFishingDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(models: FishingResultModel[]): MintFishingDto {
    return new MintFishingDto({
      summary: models.length,
      results: models.map((e) => MintFishingResult.toResponse(e)),
    });
  }
}
