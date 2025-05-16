import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomCommentThreadsEntity } from '~/entity/custom/custom-comment-threds.entity';
import { CustomCommentWithProfileIconEntity } from '~/entity/custom/custom-comment-with-profile-icon.entity';
import { Member } from '~/entity/member.entity';
import { CommentService } from './comment.service';
import { CommentRequestDto } from './dto/comment-request-dto';
import { CommentsResponseDto } from './dto/comments-response-dto';

@ApiTags('comment')
@ApiBearerAuth()
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ summary: 'コメント' })
  @ApiParam({
    type: 'string',
    name: 'parentId',
    description: 'fishingResultId or postId',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Post(':parentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async comment(
    @Req() req: { user: Member },
    @Param('parentId') parentId: string,
    @Body() request: CommentRequestDto,
  ): Promise<void> {
    await this.commentService.register(
      CommentRequestDto.toRegisterModel(req.user.id, parentId, null, request),
    );
  }

  @ApiOperation({ summary: 'コメント取得' })
  @ApiParam({
    type: 'string',
    name: 'parentId',
    description: 'fishingResultId or postId',
  })
  @ApiQuery({
    name: 'withThreads',
    required: false,
    description:
      'If you want to retrieve the list of threads as well, please specify true.',
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CustomCommentWithProfileIconEntity,
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':parentId')
  @HttpCode(HttpStatus.OK)
  async comments(
    @Param('parentId') parentId: string,
    @Query('withThreads') withThreads: string,
  ): Promise<CommentsResponseDto[]> {
    const [comments, threads] = await Promise.all([
      this.commentService.getCommentsByParentId(parentId),
      withThreads === 'true'
        ? this.commentService.getThreadsByParentId(parentId, null)
        : Promise.resolve([]),
    ]);
    return CommentsResponseDto.of(comments, threads);
  }

  @ApiOperation({ summary: 'コメント取得' })
  @ApiParam({ type: 'string', name: 'id', description: 'commentId' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CustomCommentWithProfileIconEntity,
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('one/:id')
  @HttpCode(HttpStatus.OK)
  async get(
    @Param('id') id: string,
  ): Promise<CustomCommentWithProfileIconEntity> {
    return await this.commentService.getCommentById(id);
  }

  @ApiOperation({
    summary: 'コメント削除',
    description: '自信が投稿したコメントを削除',
  })
  @ApiParam({ type: 'string', name: 'id', description: 'commentId' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Req() req: { user: Member },
    @Param('id') id: string,
  ): Promise<void> {
    return await this.commentService.delete(id, req.user.id);
  }

  @ApiOperation({ summary: 'スレッド内コメント投稿' })
  @ApiParam({
    type: 'string',
    name: 'parentId',
    description: 'fishingResultId or postId',
  })
  @ApiParam({
    type: 'string',
    name: 'parentCommentId',
    description: 'the comment-id you want to reply',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Post(':parentId/thread/:parentCommentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reply(
    @Req() req: { user: Member },
    @Param('parentId') parentId: string,
    @Param('parentCommentId') parentCommentId: string,
    @Body() request: CommentRequestDto,
  ): Promise<void> {
    await this.commentService.register(
      CommentRequestDto.toRegisterModel(
        req.user.id,
        parentId,
        parentCommentId,
        request,
      ),
    );
  }

  @ApiOperation({ summary: 'スレッド内コメント一覧' })
  @ApiParam({
    type: 'string',
    name: 'parentId',
    description: 'fishingResultId or postId',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CustomCommentWithProfileIconEntity,
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':parentId/thread/:parentCommentId')
  @HttpCode(HttpStatus.OK)
  async threads(
    @Param('parentId') parentId: string,
    @Param('parentCommentId') parentCommentId: string,
  ): Promise<CustomCommentThreadsEntity[]> {
    return await this.commentService.getThreadsByParentId(
      parentId,
      parentCommentId,
    );
  }
}
