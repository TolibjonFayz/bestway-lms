export interface AdminOverviewStatsDto {
  studentCount: number;
  activeGroupCount: number;
  teacherCount: number;
  /** Share of marked days attended this month, 0-100, or null when nothing is marked. */
  avgAttendance: number | null;
  /** Mean of graded submissions this month, 0-100, or null when nothing is graded. */
  avgScore: number | null;
  ungradedCount: number;
}

export interface ActivityPointDto {
  /** Monday of the week, "2026-08-10". */
  weekStart: string;
  /** Short label for the axis, e.g. "10-avg". */
  label: string;
  submissionCount: number;
}

export type AttentionKind = 'lowAttendance' | 'inactiveStudent' | 'emptyUnit';

export interface AttentionItemDto {
  kind: AttentionKind;
  /** What the row is about — a group, student or unit name. */
  title: string;
  /** The reason, already worded for display. */
  detail: string;
  /** Where clicking the row should go. */
  href: string;
}

export interface AdminOverviewDto {
  stats: AdminOverviewStatsDto;
  activity: ActivityPointDto[];
  attention: AttentionItemDto[];
}
