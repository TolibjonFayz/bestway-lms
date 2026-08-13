export interface ScheduleEntryDto {
  groupId: number;
  groupName: string;
  courseName: string | null;
  startsAt: string;
  endsAt: string;
  status: 'done' | 'current' | 'upcoming';
  /** The group's recurring Zoom link, so the teacher starts the lesson from
      the same row that tells them it is due. */
  zoomJoinUrl: string | null;
}

export interface PendingSubmissionPreviewDto {
  id: number;
  studentId: number;
  studentName: string;
  initials: string;
  unitTitle: string;
  itemType: 'test' | 'speaking';
  submittedAt: string;
}

export interface TeacherDashboardDto {
  teacher: {
    firstName: string;
    fullName: string;
    initials: string;
  };
  today: string;
  stats: {
    pendingCount: number;
    todayLessonsCount: number;
    studentCount: number;
    /** Whole percent, last 30 days, across the teacher's own groups. */
    avgAttendance: number;
  };
  schedule: ScheduleEntryDto[];
  pendingSubmissions: PendingSubmissionPreviewDto[];
}
