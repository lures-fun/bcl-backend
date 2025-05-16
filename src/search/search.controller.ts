import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileDto } from '~/user/dto/profile.dto';
import { SearchResponseDto } from './dto/search-response-dto';
import { SearchUserRequestDto } from './dto/search-user-request-dto';
import { SearchService } from './search.service';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({ summary: 'ユーザーを検索する' })
  @ApiResponse({ status: HttpStatus.OK, type: ProfileDto, isArray: true })
  @UseGuards(AuthGuard('jwt'))
  @Post('/users')
  @HttpCode(HttpStatus.OK)
  async searchUsers(@Body() dto: SearchUserRequestDto): Promise<ProfileDto[]> {
    const res = await this.searchService.searchUsers(dto.searchText);
    return ProfileDto.toResponseSearch(res);
  }

  @ApiOperation({ summary: '釣果を検索する' })
  @ApiResponse({ status: HttpStatus.OK, type: ProfileDto, isArray: true })
  @UseGuards(AuthGuard('jwt'))
  @Post('/fishing-results')
  @HttpCode(HttpStatus.OK)
  async searchFishingResults(
    @Body() dto: SearchUserRequestDto,
  ): Promise<SearchResponseDto[]> {
    if (!dto || !dto.searchText || dto.searchText === '') {
      return [];
    }

    return await this.searchService.searchFishingResults(dto.searchText);
  }

  @ApiOperation({ summary: 'DAOトークを検索する' })
  @ApiResponse({ status: HttpStatus.OK, type: ProfileDto, isArray: true })
  @UseGuards(AuthGuard('jwt'))
  @Post('/dao-talks')
  @HttpCode(HttpStatus.OK)
  async searchDAOTalks(
    @Body() dto: SearchUserRequestDto,
  ): Promise<SearchResponseDto[]> {
    if (!dto || !dto.searchText || dto.searchText === '') {
      return [];
    }

    return await this.searchService.searchDAOTalks(dto.searchText);
  }
}
