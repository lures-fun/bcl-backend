import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowDao } from '~/dao/follow.dao';
import { MemberDao } from '~/dao/member.dao';
import { CustomFollowUnionSearchEntity } from '~/entity/custom/custom-follow-union-search.entity';
import { Follow } from '~/entity/follow.entity';
import { FollowerListDto } from './dto/follower-list.dto';
import { NotificationService } from '~/notification/notification.service';
import { Type } from '~/entity/notification.entity';

@Injectable()
export class FollowService {
  constructor(
    private readonly followDao: FollowDao,
    private readonly memberDao: MemberDao,
    private readonly notificationService: NotificationService,
  ) {}

  async follow(memberId: string, followedMemberId: string): Promise<void> {
    const existedFollow = await this.getFollow(memberId, followedMemberId);
    if (existedFollow != null) {
      return;
    }
    const followedMember = await this.memberDao.findAvailableOneById(
      followedMemberId,
    );
    const member = await this.memberDao.findAvailableOneById(memberId);
    if (followedMember == null) {
      throw new NotFoundException('Not found followed member');
    }
    const follow = new Follow();
    follow.followedMemberId = followedMemberId;
    follow.memberId = memberId;
    const now = new Date();
    follow.createdAt = now;
    follow.followedAt = now;
    await this.followDao.save(follow);

    // save notification when other follow you
    await this.notificationService.createNotification(
      Type.FOLLOWED,
      member,
      followedMemberId,
      follow.id,
    );
  }

  async unFollow(memberId: string, followedMemberId: string): Promise<void> {
    const existedFollow = await this.getFollow(memberId, followedMemberId);
    if (existedFollow == null) {
      return;
    }
    await this.followDao.delete(existedFollow.id);
    await this.notificationService.deleteNotificationByParentIdAndType(
      existedFollow.id,
      Type.FOLLOWED,
    );
  }

  async getFollow(memberId: string, followedMemberId: string): Promise<Follow> {
    return await this.followDao.findOne(memberId, followedMemberId);
  }

  async getFollowers(memberId: string): Promise<FollowerListDto[]> {
    return FollowerListDto.toResponse(
      await this.followDao.getFollowers(memberId),
    );
  }

  async getFollowersByUserName(
    userName: string,
    myMemberId: string,
  ): Promise<FollowerListDto[]> {
    const member = await this.memberDao.findAvailableOneByUserName(userName);
    if (!member) {
      throw new NotFoundException('Not found member');
    }
    return FollowerListDto.toResponse(
      await this.followDao.getOthersFollowers(member.id, myMemberId),
    );
  }

  async getFollowees(memberId: string): Promise<FollowerListDto[]> {
    return FollowerListDto.toResponse(
      await this.followDao.getFollowees(memberId),
    );
  }

  async getFolloweesByUserName(
    userName: string,
    myMemberId: string,
  ): Promise<FollowerListDto[]> {
    const member = await this.memberDao.findAvailableOneByUserName(userName);
    if (!member) {
      throw new NotFoundException('Not found member');
    }
    return FollowerListDto.toResponse(
      await this.followDao.getOthersFollowees(member.id, myMemberId),
    );
  }

  async getUnionSearch(
    userId: string,
    searchText: string,
    limit: number,
  ): Promise<CustomFollowUnionSearchEntity[]> {
    const member = await this.memberDao.findAvailableOneById(userId);
    if (!member) {
      throw new NotFoundException('Not found member');
    }
    return await this.followDao.getUnionSearch(member.id, searchText, limit);
  }
}
