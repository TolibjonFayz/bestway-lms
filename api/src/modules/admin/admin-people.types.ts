import { StudentLevel } from '@/common/enums';
import { ScheduleSlot } from '@/database/models';

export interface AdminStudentDto {
  id: number;
  fullName: string;
  initials: string;
  phone: string;
  groupId: number | null;
  groupName: string | null;
  level: StudentLevel | null;
  averageScore: number | null;
  attendancePercent: number | null;
  active: boolean;
}

export interface AdminGroupDto {
  id: number;
  name: string;
  branch: string;
  /** Recurring Zoom link; null until an admin sets one. */
  zoomJoinUrl?: string | null;
  schedule?: ScheduleSlot[];
}

export interface AdminTeacherDto {
  id: number;
  fullName: string;
  initials: string;
  phone: string;
  groups: AdminGroupDto[];
  studentCount: number;
  active: boolean;
}
