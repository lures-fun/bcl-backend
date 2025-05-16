import { CustomLureTrophyEntity } from '~/entity/custom/lure.query-trophies.entity';

export class LureTrophyModel {
  trophyId: string;
  memberId: string;
  contestId: string;
  mintId: string;
  trophyTitle: string;
  trophyContent: string;
  trophyImagePath: string;
  contestTitle: string;
  contestContent: string;
  contestImagePath: string;
  field: string;
  willBeStartAt: Date;
  willBeEndAt: Date;
  userName: string;
  trophyType: string;

  constructor(param: Partial<LureTrophyModel> = {}) {
    Object.assign(this, param);
  }

  static toModels(raws: CustomLureTrophyEntity[]): LureTrophyModel[] {
    return raws.map(
      (raw) => new LureTrophyModel({ ...raw, trophyImagePath: raw.imagePath }),
    );
  }
}
