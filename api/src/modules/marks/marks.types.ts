import { AttendanceStatus } from '@/common/enums';
import { Paginated } from '@/common/types';

export interface MarksChartPointDto {
  weekIndex: number;
  isCurrent: boolean;
  average: number;
}

export interface AttendanceDayDto {
  date: string;
  status: AttendanceStatus | null;
}

export interface GradedItemDto {
  id: number;
  /** ISO instant the work was submitted. */
  date: string;
  title: string;
  itemType: 'test' | 'speaking';
  score: number;
  teacherComment: string | null;
  graderName: string | null;
}

export interface MarksDto {
  /** "2026-02" — the month this payload covers. */
  month: string;
  average: number;
  /** null when the previous month has no graded work to compare against. */
  previousAverage: number | null;
  trendPercent: number | null;
  chart: MarksChartPointDto[];
  attendance: AttendanceDayDto[];
  items: Paginated<GradedItemDto>;
}
