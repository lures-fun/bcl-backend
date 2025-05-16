import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Lure, LureType } from '~/entity/lure.entity';
import { Member } from '~/entity/member.entity';
import { DigitalLureRegisterRequestDto } from './dto/digital-lure-register-request-dto';
import { LureDetailDto } from './dto/lure-detail.dto';
import { LureRegisterRequestDto } from './dto/lure-register-request-dto';
import { MintFishingDto } from './dto/mint-fishing.dto';
import { MintTrophy } from './dto/mint-trophy.dto';
import { LureService } from './lure.service';
import { lurePurchaseRequestDto } from './dto/lure-purchase-request.dto';

@ApiTags('lures')
@ApiBearerAuth()
@Controller('lures')
export class LureController {
  constructor(private readonly lureService: LureService) {}

  @ApiOperation({ summary: 'ルアー詳細取得' })
  @ApiResponse({ status: HttpStatus.OK, type: LureDetailDto })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async get(@Param('id') id: string): Promise<LureDetailDto> {
    const res = await this.lureService.getLure(id);
    return Promise.resolve(LureDetailDto.toResponse(res));
  }

  @ApiOperation({ summary: 'ルアー登録申請' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Req() req: { user: Member },
    @Body() lureRegisterRequest: LureRegisterRequestDto,
  ): Promise<void> {
    await this.lureService.registerLure(
      LureRegisterRequestDto.toRegisterModel(req.user.id, lureRegisterRequest),
    );
  }

  @ApiOperation({ summary: 'ルアー購入申込' })
  @ApiResponse({ status: HttpStatus.CREATED, type: String })
  @UseGuards(AuthGuard('jwt'))
  @Post('/purchase')
  @HttpCode(HttpStatus.CREATED)
  async purchaseLureWithQR(
    @Req() req: { user: Member },
    @Body() lurePurchase: lurePurchaseRequestDto,
  ): Promise<string> {
    const lureId = await this.lureService.purchaseLureWithQR(
      lurePurchaseRequestDto.toPurchaseModel(req.user.id, lurePurchase),
    );
    return Promise.resolve(lureId);
  }

  @ApiOperation({ summary: 'ロスト申請' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Patch('lost/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async applyForLost(
    @Req() req: { user: Member },
    @Param('id') id: string,
  ): Promise<void> {
    await this.lureService.applyForLost(req.user.id, id);
  }

  @ApiOperation({ summary: 'ルアー再申請' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async modify(
    @Req() req: { user: Member },
    @Param('id') id: string,
    @Body() lureRegisterRequest: LureRegisterRequestDto,
  ): Promise<void> {
    return await this.lureService.modifyLure(
      LureRegisterRequestDto.toModifyModel(
        id,
        req.user.id,
        lureRegisterRequest,
      ),
    );
  }

  @ApiOperation({ summary: 'ルアータイプ・色別ルアー一覧取得' })
  @ApiParam({ name: 'lureType' })
  @ApiParam({ name: 'color' })
  @ApiResponse({ status: HttpStatus.OK, type: Number })
  @UseGuards(AuthGuard('jwt'))
  @Get('/list/:userName/:lureType/:color')
  async listByUserNameAndTypeAndColor(
    @Param('userName') userName: string,
    @Param('lureType') lureType: LureType,
    @Param('color') color: string,
  ): Promise<Lure[]> {
    return this.lureService.getApprovedLuresByUserNameAndTypeAndColor(
      userName,
      lureType,
      color,
    );
  }

  @ApiOperation({ summary: 'ルアータイプ・色別釣果NFTカウント取得' })
  @ApiParam({ name: 'lureType' })
  @ApiParam({ name: 'color' })
  @ApiResponse({ status: HttpStatus.OK, type: Number })
  @UseGuards(AuthGuard('jwt'))
  @Get('/count-of/fishing-nft/:userName/:lureType/:color')
  async countOfFishingNftByLureTypeAndColor(
    @Param('userName') userName: string,
    @Param('lureType') lureType: LureType,
    @Param('color') color: string,
  ): Promise<number> {
    return this.lureService.getCountOfFishingNftByLureTypeAndColor(
      userName,
      lureType,
      color,
    );
  }

  @ApiOperation({ summary: 'ルアータイプ・色別タイトルNFTカウント取得' })
  @ApiParam({ name: 'lureType' })
  @ApiParam({ name: 'color' })
  @ApiResponse({ status: HttpStatus.OK, type: Number })
  @UseGuards(AuthGuard('jwt'))
  @Get('/count-of/title-nft/:userName/:lureType/:color')
  async countOfTitleNftByLureTypeAndColor(
    @Param('userName') userName: string,
    @Param('lureType') lureType: LureType,
    @Param('color') color: string,
  ): Promise<number> {
    return this.lureService.getCountOfTitleNftByLureTypeAndColor(
      userName,
      lureType,
      color,
    );
  }

  @ApiOperation({ summary: 'ルアータイプ・色別最大サイズ取得' })
  @ApiParam({ name: 'lureType' })
  @ApiParam({ name: 'color' })
  @ApiResponse({ status: HttpStatus.OK, type: Number })
  @UseGuards(AuthGuard('jwt'))
  @Get('/big-fish/:userName/:lureType/:color')
  async bigFishByLureTypeAndColor(
    @Param('userName') userName: string,
    @Param('lureType') lureType: LureType,
    @Param('color') color: string,
  ): Promise<number> {
    return this.lureService.getBigFishByLureTypeAndColor(
      userName,
      lureType,
      color,
    );
  }

  @ApiOperation({ summary: '釣果NFT一覧取得' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: MintFishingDto })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/mint-fishing')
  async getMintFishing(@Param() params): Promise<MintFishingDto> {
    const res = await this.lureService.getFishingResults(params.id);
    return Promise.resolve(MintFishingDto.toResponse(res));
  }

  @ApiOperation({ summary: '獲得トロフィーNFT一覧取得' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: MintTrophy })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/mint-trophy')
  async getMintTrophy(@Param() params): Promise<MintTrophy> {
    const res = await this.lureService.getTrophies(params.id);
    return Promise.resolve(MintTrophy.toResponse(res));
  }

  @ApiOperation({ summary: '殿堂入りルアーを追加' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('hall-of-fame/:id')
  async legendaryLureAdmittance(@Param('id') id: string): Promise<void> {
    await this.lureService.admitLegendaryLure(id);
  }

  @ApiOperation({ summary: 'デジタルルアー登録' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @HttpCode(HttpStatus.CREATED)
  @Post('digital-lure/:id')
  async registerDigitalLure(
    @Param('id') id: string,
    @Body() digitalLureRegisterRequestDto: DigitalLureRegisterRequestDto,
    @Req() req,
  ): Promise<void> {
    const authToken = req.headers.authorization;
    const token = authToken.slice(7);
    await this.lureService.registerDigitalLure(
      id,
      token,
      digitalLureRegisterRequestDto,
    );
  }
}
