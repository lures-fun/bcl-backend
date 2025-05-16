import { Merchandise } from '~/entity/merchandise.entity';

export class MerchandiseDetailDto extends Merchandise {
  constructor(param: Partial<MerchandiseDetailDto> = {}) {
    super();
    Object.assign(this, param);
  }

  static toResponse(raw: any): MerchandiseDetailDto {
    return new MerchandiseDetailDto(raw);
  }

  static toResponses(raws: any[]): MerchandiseDetailDto[] {
    return raws.map((raw) => new MerchandiseDetailDto(raw));
  }
}
