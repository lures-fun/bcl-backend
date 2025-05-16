import { ApiProperty } from '@nestjs/swagger';
import { RankingModel } from '~/ranking/model/ranking.model';
import { RankingFieldDto } from './ranking-field.response.dto';

export class RankingFieldsDto {
  @ApiProperty({ type: RankingFieldDto, isArray: true })
  fields: RankingFieldDto[];

  constructor(param: Partial<RankingFieldsDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(models: RankingModel[]) {
    return new RankingFieldsDto({
      fields: models.map((model) => RankingFieldDto.toResponse(model)),
    });
  }
}
