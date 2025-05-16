import { LureType } from '~/entity/lure.entity';
import { Trophy } from '~/entity/trophy.entity';

export class TrophyDetailModel extends Trophy {
  size: number;
  caughtAt: Date;
  field: string;
  fishType: string;
  freeTextLure: string;
  rod: string;
  reel: string;
  line: string;
  lureType: LureType;
  color: string;

  constructor(param: Partial<TrophyDetailModel> = {}) {
    super();
    Object.assign(this, param);
  }

  static toModels(raw: any): TrophyDetailModel {
    return new TrophyDetailModel(raw);
  }
}
