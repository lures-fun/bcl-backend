import {
  BadRequestException,
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
import {
  WHITE_LIST_IMAGE_EXTENSIONS,
  WHITE_LIST_VIDEO_EXTENSIONS,
} from '~/util/file.utils';
import { S3PathType, S3Utils } from '~/util/s3.utils';

@ApiTags('s3')
@ApiBearerAuth()
@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Utils: S3Utils) {}

  @ApiOperation({ summary: 'S3署名付きURL取得' })
  @ApiResponse({ status: HttpStatus.OK, type: String })
  @ApiParam({ name: 'pathType', enum: S3PathType })
  @ApiParam({ name: 'extension', example: 'mp4' })
  @UseGuards(AuthGuard('jwt'))
  @Get('/presigned-url/:pathType/:extension')
  @HttpCode(HttpStatus.OK)
  async getPresignedUrl(
    @Param('pathType') pathType: S3PathType,
    @Param('extension') extension: string,
    @Req() req: { user: Member },
  ): Promise<string> {
    // Reject suitable ENUMs
    if (!this.isValidEnumValue(pathType.toLowerCase(), S3PathType)) {
      throw new BadRequestException('pathType is not a valid enum value');
    }

    // Check using a whitelist of extensions to reduce security risks
    const lowercaseExtension = extension.toLowerCase();
    const isValidExtension =
      WHITE_LIST_IMAGE_EXTENSIONS.includes(lowercaseExtension) ||
      WHITE_LIST_VIDEO_EXTENSIONS.includes(lowercaseExtension);
    if (!isValidExtension) {
      throw new BadRequestException('サポートされていないイメージの形式です。');
    }

    // Returns a URL that can be uploaded to S3 from the front end
    return await this.s3Utils.generatePresignedUrl(
      req.user.id,
      pathType,
      extension,
      5,
    );
  }

  private isValidEnumValue(value: any, enumType: any): boolean {
    return Object.values(enumType).includes(value);
  }
}
