import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
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
import { Timeline } from '~/entity/custom/timeline.entity';
import { Member } from '~/entity/member.entity';
import { TimelineService } from './timeline.service';
import { PageDto } from './dto/page.dto';
import { PageOptionsDto } from './dto/page-options.dto';

@ApiTags('timelines')
@ApiBearerAuth()
@Controller('timelines')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @ApiOperation({ summary: 'タイムライン' })
  @ApiResponse({ status: HttpStatus.OK, type: Timeline, isArray: true })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @HttpCode(HttpStatus.OK)
  async timelines(
    @Req() req: { user: Member },
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Timeline>> {
    return await this.timelineService.getTimelines(req.user.id, pageOptionsDto);
  }

  @ApiOperation({ summary: 'フォロワータイムライン' })
  @ApiResponse({ status: HttpStatus.OK, type: Timeline, isArray: true })
  @UseGuards(AuthGuard('jwt'))
  @Get('follower')
  @HttpCode(HttpStatus.OK)
  async followerTimelines(@Req() req: { user: Member }): Promise<Timeline[]> {
    return await this.timelineService.getFollowerTimelines(req.user.id);
  }

  @ApiOperation({ summary: 'SNS未読タイムラインの存在判定' })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @UseGuards(AuthGuard('jwt'))
  @Get('exists-unread')
  @HttpCode(HttpStatus.OK)
  async existsUnreadTimelines(@Req() req: { user: Member }): Promise<boolean> {
    return await this.timelineService.hasUnreadTimeline(req.user.id);
  }
}
