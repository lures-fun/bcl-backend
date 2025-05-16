import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { Member } from '~/entity/member.entity';
import { AnglerDto } from './dto/angler.dto';
import { ProfileNameDto } from './dto/profile-name.dto';
import { ProfileDto } from './dto/profile.dto';
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'マイページに表示する情報' })
  @ApiResponse({ status: HttpStatus.OK, type: Member })
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: { user: Member }): Promise<ProfileDto> {
    return await ProfileDto.toResponse(req.user);
  }

  @ApiOperation({ summary: 'ユーザプロフィール更新' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
      }),
    }),
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  async postProfile(
    @Req() req: { user: Member },
    @UploadedFile() file,
    @Body() profileNameDto: ProfileNameDto,
  ): Promise<void> {
    const member = req.user;
    member.updatedAt = new Date();
    if (file) {
      member.profileIcon = await this.userService.uploadFile(file, member);
    }
    member.lastName = profileNameDto.lastName;
    member.firstName = profileNameDto.firstName;
    member.userName = profileNameDto.userName;
    return await this.userService.save(member);
  }

  @ApiOperation({ summary: 'アングラー情報更新' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile/angler')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postProfileAngler(
    @Req() req: { user: Member },
    @Body() anglerDto: AnglerDto,
  ): Promise<void> {
    const member = {
      ...(await this.userService.getMember(req.user.id)),
      ...anglerDto,
    };
    return await this.userService.save(member);
  }

  @ApiOperation({ summary: '退会' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @UseGuards(AuthGuard('jwt'))
  @Patch('withdrawal')
  @HttpCode(HttpStatus.NO_CONTENT)
  async withdrawal(@Req() req: { user: Member }): Promise<void> {
    return await this.userService.withdrawal(req.user.id);
  }
}
