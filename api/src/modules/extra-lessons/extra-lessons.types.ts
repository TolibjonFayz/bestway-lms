import { ExtraLessonStatus } from '@/common/enums';

export interface ExtraLessonRequestDto {
  id: number;
  topic: string;
  unitId: number | null;
  unitTitle: string | null;
  preferredTime: string | null;
  status: ExtraLessonStatus;
  teacherNote: string | null;
  createdAt: string;
  answeredAt: string | null;
}

/** The teacher's queue carries who asked, which the student's own list does not. */
export interface TeacherExtraLessonRequestDto extends ExtraLessonRequestDto {
  studentId: number;
  studentName: string;
  studentInitials: string;
  groupName: string | null;
}
