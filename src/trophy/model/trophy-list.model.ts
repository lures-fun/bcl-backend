import { LureType } from '~/entity/lure.entity';

export class TrophyListModel {
  trophyId: string;
  memberId: string;
  contestId: string;
  field: string;
  color: string;
  lureType: LureType;
  lureImagePath: string;
  size: number;
  userName: string;
  profileIcon: string;
  caughtAt: Date;
  lureId: string;

  constructor(param: Partial<TrophyListModel> = {}) {
    Object.assign(this, param);
  }

  static toModels(raws: any[]): TrophyListModel[] {
    return raws.map((raw) => new TrophyListModel(raw));
  }
}
