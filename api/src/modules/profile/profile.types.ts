import { StudentLevel } from '@/common/enums';

export interface ProfileDto {
  fullName: string;
  initials: string;
  avatarUrl: string | null;
  level: StudentLevel | null;
  groupName: string | null;
  branch: string | null;
  /** ISO instant the account was created. */
  memberSince: string;
  notificationsEnabled: boolean;
}

/** Icon/tone only describe the *earned* look — a locked badge always renders
    as a generic padlock regardless of which achievement it is, so the client
    owns that fallback rather than the API repeating it per row. */
export interface AchievementDto {
  id: string;
  icon: string;
  tone: 'orange' | 'green' | 'amber';
  earned: boolean;
}
