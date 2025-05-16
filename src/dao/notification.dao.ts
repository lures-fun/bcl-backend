import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { Notification, Type, Status } from '~/entity/notification.entity';
import { Member } from '~/entity/member.entity';
import { readFileSync } from 'fs';
import { CustomNotificationDetailEntity } from '~/entity/custom/custom-notification-detail.entity';
import { CustomNotificationWithCommentEntity } from '~/entity/custom/custom-notification-with-comment.entity';

@Injectable()
export class NotificationDao {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async save(notification: Notification): Promise<Notification> {
    return await this.notificationRepository.save(notification);
  }

  async findById(id: string): Promise<Notification> {
    return await this.notificationRepository.findOne({ where: { id } });
  }

  async findByReceiverId(toMemberId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { toMemberId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * This method updates the status of multiple notifications based on their IDs.
   * It uses a CASE statement in the UPDATE query to dynamically set the status
   * for each notification based on its ID.
   *
   * @param statusUpdates An array of objects containing the ID and new status of each notification.
   */
  async updateStatus(
    statusUpdates: { id: string; status: Status }[],
  ): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        status: () =>
          'CASE id ' +
          statusUpdates
            .map((update) => `WHEN '${update.id}' THEN '${update.status}'`)
            .join(' ') +
          ' END',
      })
      .whereInIds(statusUpdates.map((update) => update.id))
      .execute();
  }

  async updateLastReadAt(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ lastReadAt: new Date() })
      .where('to = :userId', { userId })
      .andWhere('last_read_at IS NULL')
      .execute();
  }

  async findByType(notificationType: Type): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { notificationType },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadNotifications(
    toMember: string,
  ): Promise<{ notification: CustomNotificationDetailEntity[] }> {
    const sql = readFileSync(
      'src/dao/mapper/get-query-notifications-by-user-id.sql',
      'utf-8',
    );
    const raws = await this.entityManager.query(sql, [toMember]);
    return { notification: CustomNotificationDetailEntity.toEntities(raws) };
  }

  async delete(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async getUnreadCount(toMemberId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        toMemberId,
        lastReadAt: IsNull(),
      },
    });
  }

  async findByParentId(parentId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { parentId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteNotification(
    fromMember: Member,
    toMemberId: string,
    notificationType: Type,
  ): Promise<void> {
    await this.notificationRepository.delete({
      fromMember,
      toMemberId,
      notificationType,
    });
  }
  async deleteByParentIdAndType(
    parentId: string,
    notificationType: Type,
  ): Promise<void> {
    await this.notificationRepository.delete({
      parentId,
      notificationType,
    });
  }

  async findReadyNotifications(): Promise<
    CustomNotificationWithCommentEntity[]
  > {
    const sql = readFileSync(
      'src/dao/mapper/get-query-notifications-with-comment-by-status.sql',
      'utf-8',
    );
    const raws = await this.entityManager.query(sql, [Status.READY]);
    return CustomNotificationWithCommentEntity.toEntities(raws);
  }
}
