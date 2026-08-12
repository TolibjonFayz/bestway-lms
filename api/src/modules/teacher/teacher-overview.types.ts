import { LessonItemType, StudentLevel } from '@/common/enums';

export interface TeacherTaskRowDto {
  lessonItemId: number;
  title: string;
  type: LessonItemType;
  unitTitle: string;
  courseName: string;
  /** How many of the teacher's students have a graded or pending submission. */
  submittedCount: number;
  pendingCount: number;
  gradedCount: number;
  /** Students in the filtered groups who have not submitted at all. */
  notStartedCount: number;
  /** Mean of graded scores, 0-100, or null when nothing is graded. */
  averageScore: number | null;
}

export interface TeacherStudentRowDto {
  id: number;
  fullName: string;
  initials: string;
  phone: string;
  groupId: number | null;
  groupName: string | null;
  level: StudentLevel | null;
  averageScore: number | null;
  attendancePercent: number | null;
  /** Last submission time, or null if they have never submitted. */
  lastActivityAt: string | null;
  pendingCount: number;
}
