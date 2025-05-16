import {
  Body,
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
import { FollowRequestDto } from './dto/follow-request.dto';
import { FollowerListDto } from './dto/follower-list.dto';
import { UnionSearchRequestDto } from './dto/union-search-request.dto';
import { UnionSearchResponseDto } from './dto/union-search-response.dto';
import { FollowService } from './follow.service';

@ApiTags('follow')
@ApiBearerAuth()
@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @ApiOperation({ summary: 'フォロー' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Post('/')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async follow(
    @Req() req: { user: Member },
    @Body() followRequestDto: FollowRequestDto,
  ): Promise<void> {
    return await this.followService.follow(
      req.user.id,
      followRequestDto.followedMemberId,
    );
  }

  @ApiOperation({ summary: 'フォロー解除' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Delete('/')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async unFollow(
    @Req() req: { user: Member },
    @Body() followRequestDto: FollowRequestDto,
  ): Promise<void> {
    return await this.followService.unFollow(
      req.user.id,
      followRequestDto.followedMemberId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/followers')
  @HttpCode(HttpStatus.OK)
  async getFollowers(@Req() req: { user: Member }): Promise<FollowerListDto[]> {
    return FollowerListDto.toResponse(
      await this.followService.getFollowers(req.user.id),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/followers/:userName')
  @HttpCode(HttpStatus.OK)
  async getFollowersByUserName(
    @Req() req: { user: Member },
    @Param() params,
  ): Promise<FollowerListDto[]> {
    return FollowerListDto.toResponse(
      await this.followService.getFollowersByUserName(
        params.userName,
        req.user.id,
      ),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/followees')
  @HttpCode(HttpStatus.OK)
  async getFollowees(@Req() req: { user: Member }): Promise<FollowerListDto[]> {
    return FollowerListDto.toResponse(
      await this.followService.getFollowees(req.user.id),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/followees/:userName')
  @HttpCode(HttpStatus.OK)
  async getFolloweesByUserName(
    @Req() req: { user: Member },
    @Param() params,
  ): Promise<FollowerListDto[]> {
    return FollowerListDto.toResponse(
      await this.followService.getFolloweesByUserName(
        params.userName,
        req.user.id,
      ),
    );
  }

  @ApiOperation({ summary: '一覧検索' })
  @UseGuards(AuthGuard('jwt'))
  @Post('/union-search')
  @HttpCode(HttpStatus.OK)
  async postUnionSearch(
    @Req() req: { user: Member },
    @Body() dto: UnionSearchRequestDto,
  ): Promise<UnionSearchResponseDto[]> {
    const limit = dto.limit ? dto.limit : 500;
    return UnionSearchResponseDto.of(
      await this.followService.getUnionSearch(
        req.user.id,
        dto.searchText,
        limit,
      ),
    );
  }
}
