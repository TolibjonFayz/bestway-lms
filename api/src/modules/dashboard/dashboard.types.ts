import { CourseSubject, LessonItemType } from '@/common/enums';

export interface NextLessonDto {
  /** "IELTS — Unit 5.2" */
  title: string;
  courseName: string;
  unitTitle: string | null;
  teacherName: string | null;
  /** UTC instant the lesson starts. */
  startsAt: string;
  endsAt: string;
  /** UTC instant the join button becomes usable — start minus the grace window. */
  joinOpensAt: string;
  /** Closes once the slot is over; the client hides the card after this. */
  joinClosesAt: string;
}

export interface UnitItemProgressDto {
  id: number;
  type: LessonItemType;
  title: string;
  percent: number;
}

export interface CurrentUnitDto {
  unitId: number;
  title: string;
  courseName: string;
  subject: CourseSubject;
  level: string | null;
  percent: number;
  items: UnitItemProgressDto[];
}

export interface WeeklyDayDto {
  /** "2026-02-05" in Asia/Tashkent. */
  date: string;
  /** Uzbek two-letter column head: Du, Se, Ch, Pa, Ju, Sh, Ya. */
  label: string;
  active: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export interface AnnouncementDto {
  id: number;
  title: string;
  icon: string;
  tone: string;
  /** Recency-based until per-student read tracking lands with the full feature. */
  unread: boolean;
}

export interface DashboardStatsDto {
  coins: number;
  points: number;
  /** null when the student has no scored work yet. */
  rank: number | null;
  rankedOutOf: number;
  homework: {
    unitTitle: string | null;
    percent: number;
  } | null;
}

export interface DashboardDto {
  student: {
    id: number;
    firstName: string;
    fullName: string;
    level: string | null;
    initials: string;
  };
  /** UTC instant the payload was built — the client formats it for Tashkent. */
  today: string;
  /** True when the student has no progress at all: the empty state. */
  isNew: boolean;
  nextLesson: NextLessonDto | null;
  stats: DashboardStatsDto;
  currentUnit: CurrentUnitDto | null;
  weekly: {
    days: WeeklyDayDto[];
    activeDays: number;
  };
  announcements: AnnouncementDto[];
}
