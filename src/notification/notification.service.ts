// notification.service.ts
import { Injectable } from '@nestjs/common';
import { NotificationDao } from '~/dao/notification.dao';
import { Notification, Type, Status } from '~/entity/notification.entity';
import { Member } from '~/entity/member.entity';
import { TokenExpo } from '~/entity/tokens-expo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { CustomNotificationWithCommentEntity } from '~/entity/custom/custom-notification-with-comment.entity';

interface ExpoNotificationType extends ExpoPushMessage {
  notificationId: string;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationDao: NotificationDao,
    @InjectRepository(TokenExpo)
    private readonly tokenExpoRepository: Repository<TokenExpo>,
  ) {}

  async createNotification(
    type: Type,
    fromMember: Member,
    toMemberId: string,
    parentId?: string,
  ): Promise<Notification> {
    const notification = new Notification();
    notification.notificationType = type;
    notification.fromMember = fromMember;
    notification.toMemberId = toMemberId;
    notification.status = Status.READY;
    notification.parentId = parentId;
    notification.createdAt = new Date();

    return await this.notificationDao.save(notification);
  }

  // Marks a notification as read by updating its last read timestamp
  async markAsRead(userId: string): Promise<void> {
    await this.notificationDao.updateLastReadAt(userId);
  }

  async getUnreadNotifications(
    toMemberId: string,
  ): Promise<{ notification: Notification[] }> {
    return await this.notificationDao.findUnreadNotifications(toMemberId);
  }

  /**
   * This method sends push notifications to Expo clients for ready notifications.
   * It fetches all ready notifications, maps them to Expo notification format,
   * and sends them to Expo server for delivery.
   *
   * @returns Promise<void>
   */
  async sendPushNotifications(): Promise<void> {
    const tokens = await this.tokenExpoRepository.find();
    if (tokens.length === 0) {
      return;
    }
    const notifications = await this.notificationDao.findReadyNotifications();
    if (notifications.length === 0) {
      return;
    }
    const changeStatus = []; // Array to hold status updates
    notifications.forEach((noti) => {
      changeStatus.push({
        id: noti.id,
        status: Status.PROCESSING,
      });
    });
    await this.notificationDao.updateStatus(changeStatus);
    // New structure for notifications
    const formattedNotifications = notifications.map((notification) => {
      const tokenList = tokens
        .filter((token) => token.memberId === notification.toMemberId)
        .map((token) => token.token);
      return {
        to: tokenList.length > 1 ? tokenList : tokenList[0], // Send to multiple tokens if available
        body: this.getNotificationBody(notification), // Use the existing method to get the body
        sound: 'default',
        notificationId: notification.id, // to track the notification id which is success or fail
        badge: notifications.length > 0 ? notifications.length : 0,
      };
    });

    const expo = new Expo();
    const chunks = expo.chunkPushNotifications(formattedNotifications);
    const statusUpdates = [];
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
        // Collect successful notifications for status update
        chunk.forEach((chunk: ExpoNotificationType) => {
          statusUpdates.push({
            id: chunk.notificationId,
            status: Status.FIX,
          });
        });
      } catch (error) {
        console.error('Error sending push notification:', error);
        // Collect failed notifications for status update
        chunk.forEach((notification: ExpoNotificationType) => {
          statusUpdates.push({
            id: notification.notificationId,
            status: Status.ERROR, // Update status to ERROR
          });
        });
      }
    }
    // Perform a bulk update for all notifications
    await this.notificationDao.updateStatus(statusUpdates);
  }

  // Gets the count of unread notifications for a specific user
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationDao.getUnreadCount(userId);
  }

  // Deletes a notification based on the member and type
  async deleteNotification(
    fromMember: Member,
    toMember: string,
    type: Type,
  ): Promise<void> {
    await this.notificationDao.deleteNotification(fromMember, toMember, type);
  }

  // Deletes a notification based on the member and type
  async deleteNotificationByParentIdAndType(
    parentId: string,
    type: Type,
  ): Promise<void> {
    await this.notificationDao.deleteByParentIdAndType(parentId, type);
  }

  // Adds a token for a member, updating if it already exists
  async addTokenForMember(memberId: string, token: string): Promise<TokenExpo> {
    // Check if a token already exists for the member
    const existingToken = await this.tokenExpoRepository.findOne({
      where: { token },
    });

    if (existingToken) {
      // Update member id
      existingToken.memberId = memberId;
      return await this.tokenExpoRepository.save(existingToken);
    } else {
      // Create a new token if none exists
      const newToken = this.tokenExpoRepository.create({
        token,
        memberId,
      });
      return await this.tokenExpoRepository.save(newToken);
      // * Without save(), the changes to existingToken will not be persisted to the database.
      // * The create() method alone does not insert data into the database; it only prepares the entity.
    }
  }

  // Constructs the body of the notification message based on its type
  private getNotificationBody(
    notification: CustomNotificationWithCommentEntity,
  ): string {
    switch (notification.notificationType) {
      case Type.RECEIVE_COMMENT:
        return `${notification.fromMemberName}がコメントしました。「${notification.comment}」`;
      case Type.RECEIVE_BBT:
        return 'BBTの受け取りが完了しました。';
      case Type.REGISTER_LURE:
        return 'ルアーの登録が完了しました。';
      case Type.APPROVE_FISHING_RESULT:
        return '釣果申請が完了しました。';
      case Type.RECEIVE_TROPHY:
        return 'タイトルを付与しました。';
      case Type.FOLLOWED:
        return `${notification.fromMemberName}があなたをフォローしました。`;
      case Type.RECEIVE_LIKE:
        return `${notification.fromMemberName}があなたの投稿に「いいね！」しました。`;
    }
  }
}
