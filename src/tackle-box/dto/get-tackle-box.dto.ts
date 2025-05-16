import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '~/entity/lure-review-status.entity';
import { LureType } from '~/entity/lure.entity';
import { TackleBoxModel } from '../model/tackle-box.model';

export class LureDto {
  @ApiProperty({ example: 1 })
  id: string;
  @ApiProperty({ example: 'W3_CRANKBAIT' })
  lureType: LureType;
  @ApiProperty({ example: '#01' })
  lureColor: string;
  @ApiProperty({ example: '01/001' })
  serialCode: string;
  @ApiProperty({ example: 'https://placehold.jp/150x150.png' })
  imagePath: string;
  @ApiProperty({ enum: ReviewStatus })
  reviewStatus: ReviewStatus;
  @ApiProperty({ example: false })
  isLost: boolean;
  @ApiProperty({example: false})
  legendary: boolean;
  @ApiProperty({example: '"2024-01-01T00:00:00.000Z"' })
  updatedAt: Date;

  constructor(param: Partial<LureDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(lures: TackleBoxModel): LureDto {
    return new LureDto({
      id: lures.id,
      lureType: lures.lureType,
      lureColor: lures.lureColor,
      serialCode: lures.serialCode,
      imagePath: lures.imagePath,
      reviewStatus: lures.reviewStatus,
      isLost: lures.isLost,
      legendary: lures.legendary,
      updatedAt: lures.updatedAt,
    });
  }
}

export class GetTackleBoxDto {
  @ApiProperty({ type: LureDto, isArray: true })
  crankbaits: LureDto[];
  @ApiProperty({ type: LureDto, isArray: true })
  draftWakers: LureDto[];
  @ApiProperty({ type: LureDto, isArray: true })
  otherLures: LureDto[];

  constructor(param: Partial<GetTackleBoxDto> = {}) {
    Object.assign(this, param);
  }

  static toResponse(lures: TackleBoxModel[]): GetTackleBoxDto {
    const crankbaits = TackleBoxModel.filterCrankbaits(lures);
    const draftWakers = TackleBoxModel.filterDraftWakers(lures);
    const otherLures = TackleBoxModel.filterOtherLures(lures);
    return new GetTackleBoxDto({
      crankbaits: crankbaits.map((e) => LureDto.toResponse(e)),
      draftWakers: draftWakers.map((e) => LureDto.toResponse(e)),
      otherLures: otherLures.map((e) => LureDto.toResponse(e)),
    });
  }
}
