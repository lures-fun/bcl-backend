import {
  Body,
  Controller,
  Delete,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Member } from '~/entity/member.entity';
import * as PostEntity from '~/entity/post.entity';
import { PostRegisterResponseDto } from './dto/post-register-response-dto';
import { PostRequestDto } from './dto/post-request-dto';
import { PostService } from './post.service';

@ApiTags('post')
@ApiBearerAuth()
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: '投稿' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async post(
    @Req() req: { user: Member },
    @Body() request: PostRequestDto,
  ): Promise<PostRegisterResponseDto> {
    const earnedToken = await this.postService.register(
      PostRequestDto.toRegisterModel(req.user.id, request),
    );
    return new PostRegisterResponseDto({ earnedToken });
  }

  @ApiOperation({ summary: '投稿編集' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async patch(
    @Req() req: { user: Member },
    @Param('id') id: string,
    @Body() request: PostRequestDto,
  ): Promise<void> {
    return await this.postService.modify(
      PostRequestDto.toModifyModel(id, req.user.id, request),
    );
  }

  @ApiOperation({ summary: '自信の投稿を削除' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Req() req: { user: Member },
    @Param('id') id: string,
  ): Promise<void> {
    return await this.postService.delete(id, req.user.id);
  }

  @ApiOperation({ summary: '投稿' })
  @ApiResponse({ status: HttpStatus.OK, type: PostEntity.Post, isArray: true })
  @Get('/list/:userName')
  @HttpCode(HttpStatus.OK)
  async getPosts(
    @Param('userName') userName: string,
  ): Promise<PostEntity.Post[]> {
    return await this.postService.getPostsByUserName(userName);
  }

  @ApiOperation({ summary: '自信の投稿を取得' })
  @ApiResponse({ status: HttpStatus.OK, type: PostEntity.Post })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPost(@Param('id') id: string): Promise<PostEntity.Post> {
    return await this.postService.getPostById(id);
  }
}
