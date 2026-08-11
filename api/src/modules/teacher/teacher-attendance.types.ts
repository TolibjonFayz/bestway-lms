import { AttendanceStatus } from '@/common/enums';

export interface RegisterDayDto {
  /** "2026-08-11" in Asia/Tashkent. */
  date: string;
  dayOfMonth: number;
  /** 0 = Sunday, matching localParts().weekday. */
  weekday: number;
  /** False when the group's timetable has no slot on this weekday. */
  hasLesson: boolean;
  /** True for a date that has not happened yet — not markable. */
  isFuture: boolean;
}

export interface RegisterStudentDto {
  id: number;
  fullName: string;
  initials: string;
  /** Date key → status, only for days that carry a mark. */
  marks: Record<string, AttendanceStatus>;
  attendancePercent: number | null;
}

export interface AttendanceRegisterDto {
  group: { id: number; name: string; branch: string };
  /** "2026-08" */
  month: string;
  days: RegisterDayDto[];
  students: RegisterStudentDto[];
}
