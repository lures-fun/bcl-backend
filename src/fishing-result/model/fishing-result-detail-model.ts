import { FishingResult } from '~/entity/fishing-result.entity';

export class FishingResultDetailModel extends FishingResult {
  rodName: string;
  lineName: string;
  reelName: string;
  fieldName: string;
  lureName: string;

  constructor(param: Partial<FishingResultDetailModel> = {}) {
    super();
    Object.assign(this, param);
  }

  static buildFromRaws(raws: any[]): FishingResultDetailModel {
    if (!raws.length || raws.length > 1) {
      return null;
    }
    const raw = raws[0];
    return new FishingResultDetailModel({
      id: raw.id,
      mintId: raw.mint_id,
      memberId: raw.member_id,
      title: raw.title,
      size: raw.size,
      lureId: raw.lure_id,
      fishType: raw.fish_type,
      lureName: raw.free_text_lure ?? `${raw.lure_type} #${raw.color}`,
      freeTextLure: raw.free_text_lure,
      rod: raw.rod,
      line: raw.line,
      reel: raw.reel,
      field: raw.field,
      rodName: raw.rod_name,
      lineName: raw.line_name,
      reelName: raw.reel_name,
      fieldName: raw.field_name,
      imagePathForApply: raw.image_path_for_apply,
      imagePathForNft: raw.image_path_for_nft,
      comment: raw.comment,
      caughtAt: raw.caught_at,
      extensionForApply: raw.extension_for_apply,
      extensionForNft: raw.extension_for_nft,
      imagePathForSizeConfirmation: raw.image_path_for_size_confirmation,
      extensionForSizeConfirmation: raw.extension_for_size_confirmation,
    });
  }
}
