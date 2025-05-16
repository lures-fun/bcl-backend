import { Lure, LureType } from "~/entity/lure.entity";

export class LegendaryLureDto {
    id: string; 
    lureType: LureType;
    color: string; 
    imagePathForNft: string; 

    constructor (param: Partial<LegendaryLureDto> = {}) {
        Object.assign(this, param);
    }

    static toResponse (raws: any[]) {
        return raws.map(raw => new LegendaryLureDto({
            id: raw.id,
            lureType: raw.lure_type,
            color: raw.color,
            imagePathForNft: raw.image_path_for_nft
        }))
    }
}