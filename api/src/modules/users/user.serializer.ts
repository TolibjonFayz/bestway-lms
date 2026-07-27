import { StudentLevel, UserRole } from '@/common/enums';
import { User } from '@/database/models';

/** A user as the API is allowed to show it — no password hash, ever. */
export interface PublicUser {
  id: number;
  phone: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  level: StudentLevel | null;
  groupId: number | null;
  active: boolean;
  createdAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    phone: user.phone,
    fullName: user.fullName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    level: user.level,
    groupId: user.groupId,
    active: user.active,
    createdAt: user.createdAt,
  };
}
