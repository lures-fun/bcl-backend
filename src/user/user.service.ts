import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { QueryFailedError } from 'typeorm';
import { Member, MemberStatus } from '~/entity/member.entity';
import { deleteUploadFile } from '~/util/delete.upload.file';
import { S3Utils } from '~/util/s3.utils';
import { MemberDao } from '../dao/member.dao';

@Injectable()
export class UserService {
  constructor(
    private readonly memberDao: MemberDao,
    private readonly s3Utils: S3Utils,
    private readonly configService: ConfigService,
  ) {}

  async withdrawal(memberId: string): Promise<void> {
    const member = await this.memberDao.findAvailableOneById(memberId);
    if (member == null) {
      throw new NotFoundException();
    }
    member.status = MemberStatus.Withdrawal;
    await this.memberDao.save(member);
  }

  async getMember(memberId: string): Promise<Member> {
    const member = await this.memberDao.findAvailableOneById(memberId);
    if (member == null) {
      throw new NotFoundException();
    }
    return member;
  }

  async getMemberByEmail(email: string): Promise<Member> {
    return await this.memberDao.findAvailableOneByEmail(email);
  }

  async save(member: Member): Promise<void> {
    try {
      await this.memberDao.save(member);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('duplicate user name');
      }
      throw error;
    }
  }

  async uploadFile(file: any, member: Member): Promise<string> {
    // 日本語文字化けするのでデコード（フロントからエンコードして送ってもらう）
    const decodedFilename = decodeURIComponent(file.originalname);
    const s3Key = `profile-icon/${member.id}/${decodedFilename}`;
    const s3Url = await this.s3Utils.uploadFile(
      createReadStream(file.path),
      this.configService.get<string>('S3_IMAGE_BUCKET'),
      s3Key,
    );
    deleteUploadFile(file.path);
    return s3Url;
  }
}
