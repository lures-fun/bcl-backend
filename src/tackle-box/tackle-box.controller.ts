import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetTackleBoxDto } from './dto/get-tackle-box.dto';
import { TackleBoxService } from './tackle-box.service';
import { LegendaryLureDto } from './dto/legendary-lure.dto';

@ApiTags('tackle-box')
@ApiBearerAuth()
@Controller('tackle-box')
export class TackleBoxController {
  constructor(private readonly tackleService: TackleBoxService) {}

  @ApiOperation({ summary: 'デジタルタックルボックス' })
  @ApiResponse({ status: HttpStatus.OK, type: GetTackleBoxDto })
  @Get('/:userName')
  async get(
    @Headers() headers: any,
    @Param('userName') userName: string,
  ): Promise<GetTackleBoxDto> {
    const authorizationHeader = headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid or missing Bearer token');
    }
    const lures = await this.tackleService.getTackleBoxes(userName);
    return Promise.resolve(GetTackleBoxDto.toResponse(lures));
  }

  @ApiOperation({ summary: "殿堂入りルアーを手に入れる" })
  @ApiParam({ name: "userName" })
  @ApiResponse({ status: HttpStatus.OK, type: LegendaryLureDto})
  @HttpCode(HttpStatus.OK)
  @Get('hall-of-fame/:userName')
  async exportLegendaryLures(@Param('userName') userName: string) {
    return LegendaryLureDto.toResponse(
      await this.tackleService.getLegendaryTackleBoxes(userName)
    );
  }
}
