import { ScheduleSlot } from '@/database/models';

export interface TeacherGroupSummaryDto {
  id: number;
  name: string;
  branch: string;
  /** Commonest level among the group's students; null when the group is empty. */
  level: string | null;
  studentCount: number;
  schedule: ScheduleSlot[];
  /** Share of marked days that were attended this month, 0-100, or null when
      nothing has been marked yet. */
  attendancePercent: number | null;
}

export interface TeacherGroupStudentDto {
  id: number;
  fullName: string;
  initials: string;
  level: string | null;
  /** Mean of graded submissions, 0-100, or null when nothing is graded yet. */
  averageScore: number | null;
  attendancePercent: number | null;
}

export interface TeacherGroupDetailDto {
  group: TeacherGroupSummaryDto;
  students: TeacherGroupStudentDto[];
}
