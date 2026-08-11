import { StudentLevel } from '@/common/enums';

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
