import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { GalleryDto } from './dto/gallery.dto';
import { GalleryService } from './gallery.service';

@ApiTags('gallery')
@ApiBearerAuth()
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @ApiOperation({ summary: 'ギャラリー' })
  @ApiParam({ name: 'userName' })
  @ApiResponse({ status: HttpStatus.OK, type: GalleryDto })
  @Get('/:userName')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async gallery(
    @Param() params,
    @Req() req: { user: Member },
  ): Promise<GalleryDto> {
    return await this.galleryService.getGallery(params.userName, req.user);
  }
}
