import { SetMetadata } from '@nestjs/common';
import { MemberRole } from '~/entity/member.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: MemberRole[]) => SetMetadata(ROLES_KEY, roles);
