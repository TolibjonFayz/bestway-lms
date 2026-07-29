import { StudentLevel } from '@/common/enums';
import { Paginated } from '@/common/types';

export enum RatingScope {
  Group = 'group',
  Branch = 'branch',
  All = 'all',
}

export enum RatingPeriod {
  Week = 'week',
  Month = 'month',
  All = 'all',
}

export interface RankRowDto {
  rank: number;
  studentId: number;
  fullName: string;
  initials: string;
  level: StudentLevel | null;
  points: number;
  isMe: boolean;
}

export interface RatingDto {
  scope: RatingScope;
  period: RatingPeriod;
  items: Paginated<RankRowDto>;
  /** The requesting student's own row, computed against the full ranked pool
      — present even when their rank falls outside `items`' page. null only
      when they have no scored work yet (unranked, same rule as the
      dashboard) or the chosen scope has no pool for them (e.g. no group). */
  me: RankRowDto | null;
}
