import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Member } from '~/entity/member.entity';
import { GoodMemberListDto } from './dto/good-member-list.dto';
import { GoodService } from './good.service';

@ApiTags('good')
@ApiBearerAuth()
@Controller('good')
export class GoodController {
  constructor(private readonly goodService: GoodService) {}

  @ApiOperation({ summary: '釣果・投稿に対していいね' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseGuards(AuthGuard('jwt'))
  @Post(':parentId')
  @HttpCode(HttpStatus.OK)
  async post(
    @Req() req: { user: Member },
    @Param('parentId') parentId: string,
  ): Promise<void> {
    await this.goodService.register(req.user.id, parentId);
  }

  @ApiOperation({ summary: '釣果・投稿に対するいいね数を取得' })
  @ApiResponse({ status: HttpStatus.OK, type: Number })
  @UseGuards(AuthGuard('jwt'))
  @Get(':parentId')
  @HttpCode(HttpStatus.OK)
  async count(
    @Req() req: { user: Member },
    @Param('parentId') parentId: string,
  ): Promise<{ count: number; isGood: boolean }> {
    return {
      count: await this.goodService.countGood(parentId),
      isGood: await this.goodService.isGood(parentId, req.user.id),
    };
  }

  @ApiOperation({ summary: '釣果・投稿に対するいいねした会員リストを取得' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GoodMemberListDto,
    isArray: true,
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':parentId/members')
  @HttpCode(HttpStatus.OK)
  async getGoodMembers(
    @Req() req: { user: Member },
    @Param('parentId') parentId: string,
  ): Promise<GoodMemberListDto[]> {
    return GoodMemberListDto.toResponse(
      await this.goodService.getGoodMembers(req.user.id, parentId),
    );
  }

  @ApiOperation({ summary: 'いいね削除' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':parentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Req() req: { user: Member },
    @Param('parentId') parentId: string,
  ): Promise<void> {
    return await this.goodService.delete(req.user.id, parentId);
  }
}
