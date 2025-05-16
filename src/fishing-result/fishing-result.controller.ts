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
import { Member } from '~/entity/member.entity';
import {
  FishingResultApplyRequestDto,
  FishingResultApplyRequestForOtherLuresDto,
} from './dto/fishing-result-apply-request-dto';
import { FishingResultService } from './fishing-result.service';
import { FishingResultAndLureModel } from './model/fishing-result-and-lure-model';

@ApiTags('fishing-result')
@ApiBearerAuth()
@Controller('fishing-results')
export class FishingResultController {
  constructor(private readonly fishingResultService: FishingResultService) {}

  @ApiOperation({ summary: '釣果申請' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Req() req: { user: Member },
    @Body() fishingResultRegisterRequest: FishingResultApplyRequestDto,
  ): Promise<void> {
    await this.fishingResultService.register(
      FishingResultApplyRequestDto.toRegisterModel(
        req.user.id,
        fishingResultRegisterRequest,
      ),
    );
  }

  @ApiOperation({ summary: '釣果申請(その他)' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @UseGuards(AuthGuard('jwt'))
  @Post('other-lures')
  @HttpCode(HttpStatus.CREATED)
  async registerOtherLures(
    @Req() req: { user: Member },
    @Body() request: FishingResultApplyRequestForOtherLuresDto,
  ): Promise<void> {
    await this.fishingResultService.register(
      FishingResultApplyRequestForOtherLuresDto.toRegisterModel(
        req.user.id,
        request,
      ),
    );
  }

  @ApiOperation({ summary: '釣果申請(その他)更新' })
  @ApiParam({ type: 'string', name: 'id' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Patch('other-lures/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async modifyOtherLures(
    @Req() req: { user: Member },
    @Param('id') id: string,
    @Body() request: FishingResultApplyRequestForOtherLuresDto,
  ): Promise<void> {
    await this.fishingResultService.modify(
      FishingResultApplyRequestForOtherLuresDto.toModifyModel(
        id,
        req.user.id,
        request,
      ),
    );
  }

  @ApiOperation({ summary: '釣果詳細取得' })
  @ApiParam({ type: 'string', name: 'userName' })
  @ApiParam({ type: 'string', name: 'fishingResultId' })
  @ApiResponse({ status: HttpStatus.OK, type: FishingResultAndLureModel })
  @UseGuards(AuthGuard('jwt'))
  @Get(':userName/:fishingResultId')
  @HttpCode(HttpStatus.OK)
  async detail(
    @Param('userName') userName: string,
    @Param('fishingResultId') fishingResultId: string,
  ): Promise<FishingResultAndLureModel> {
    return this.fishingResultService.getByIdAndUserName(
      fishingResultId,
      userName,
    );
  }

  @ApiOperation({ summary: '釣果申請更新' })
  @ApiParam({ type: 'string', name: 'id' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async modify(
    @Req() req: { user: Member },
    @Param('id') id: string,
    @Body() fishingResultRegisterRequest: FishingResultApplyRequestDto,
  ): Promise<void> {
    await this.fishingResultService.modify(
      FishingResultApplyRequestDto.toModifyModel(
        id,
        req.user.id,
        fishingResultRegisterRequest,
      ),
    );
  }
}
