import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
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
import { BlockService } from './block.service';
import { BlockRequestDto } from './dto/block-request.dto';

@ApiTags('block')
@ApiBearerAuth()
@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @ApiOperation({ summary: 'ブロック' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Post('/')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async block(
    @Req() req: { user: Member },
    @Body() blockRequestDto: BlockRequestDto,
  ): Promise<void> {
    return await this.blockService.block(
      req.user.id,
      blockRequestDto.blockedMemberId,
    );
  }

  @ApiOperation({ summary: 'ブロック解除' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Delete('/')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async unblock(
    @Req() req: { user: Member },
    @Body() blockRequestDto: BlockRequestDto,
  ): Promise<void> {
    return await this.blockService.unblock(
      req.user.id,
      blockRequestDto.blockedMemberId,
    );
  }
}
