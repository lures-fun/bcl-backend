import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from '~/entity/notification.entity';
import { AuthGuard } from '@nestjs/passport';
import { Member } from '~/entity/member.entity';
import { TokenExpo } from '~/entity/tokens-expo.entity';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get unread notifications for current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of unread notifications',
    type: [Notification],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
  async getNotifications(
    @Req() req: { user: Member },
  ): Promise<{ notification: Notification[] }> {
    return await this.notificationService.getUnreadNotifications(req.user.id);
  }

  @ApiOperation({ summary: 'Mark notifications as read' })
  @ApiResponse({
    status: 204,
    description: 'Notification marked as read successfully',
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch('/mark-as-read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(@Req() req: { user: Member }): Promise<void> {
    await this.notificationService.markAsRead(req.user.id);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  @ApiResponse({
    status: 200,
    description: 'Returns count of unread notifications',
    type: Number,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
  async getUnreadCount(
    @Req() req: { user: Member },
  ): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post('add/noti-token')
  @ApiOperation({ summary: 'Add a token for the current member' })
  @ApiResponse({
    status: 201,
    description: 'Token added successfully',
    type: TokenExpo,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
  })
  async addToken(
    @Body() body: { token: string },
    @Req() req: { user: Member },
  ): Promise<TokenExpo> {
    return await this.notificationService.addTokenForMember(
      req.user.id,
      body.token,
    );
  }
}
