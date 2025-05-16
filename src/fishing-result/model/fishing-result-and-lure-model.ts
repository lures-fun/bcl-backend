import { ApiProperty } from '@nestjs/swagger';
import { FishingResult } from '~/entity/fishing-result.entity';
import { Lure } from '~/entity/lure.entity';

export class FishingResultAndLureModel extends FishingResult {
  @ApiProperty()
  lure: Lure;

  constructor(param: Partial<FishingResultAndLureModel> = {}) {
    super();
    Object.assign(this, param);
  }

  static buildFromRaws(raws: any[]): FishingResultAndLureModel {
    if (!raws.length || raws.length > 1) {
      return null;
    }
    const raw = raws[0];
    return new FishingResultAndLureModel({
      id: raw.id,
      memberId: raw.member_id,
      field: raw.field,
      title: raw.title,
      size: raw.size,
      fishType: raw.fish_type,
      lure: FishingResultAndLureModel.toLureEntity(raws),
      freeTextLure: raw.free_text_lure,
      rod: raw.rod,
      line: raw.line,
      reel: raw.reel,
      imagePathForApply: raw.image_path_for_apply,
      imagePathForNft: raw.image_path_for_nft,
      comment: raw.comment,
      caughtAt: raw.caught_at,
    });
  }

  private static toLureEntity(raws: any[]): Lure {
    if (!raws.length || raws.length > 1) {
      return null;
    }
    const raw = raws[0];
    return new Lure({
      id: raw.lure_id,
      mintId: raw.mint_id,
      memberId: raw.member_id,
      color: raw.color,
      serialCode: raw.serial_code,
      lureType: raw.lure_type,
      purchasedAt: raw.purchased_at,
      imagePathForNft: raw.image_path_for_nft,
    });
  }
}
