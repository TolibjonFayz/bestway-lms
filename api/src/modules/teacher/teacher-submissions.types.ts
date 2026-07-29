import { QuestionType } from '@/common/enums';

export type SubmissionListStatus = 'submitted' | 'graded';
export type SubmissionItemType = 'test' | 'speaking';

export interface SubmissionListItemDto {
  id: number;
  studentId: number;
  studentName: string;
  initials: string;
  unitTitle: string;
  itemType: SubmissionItemType;
  status: SubmissionListStatus;
  submittedAt: string;
  score: number | null;
}

export interface SubmissionQuestionReviewDto {
  id: number;
  orderIndex: number;
  type: QuestionType;
  prompt: string;
  /** Human-readable rendering of whatever the student actually answered. */
  studentAnswerText: string;
  /** null for open questions — there is no single correct answer. */
  correctAnswerText: string | null;
  /** null for open questions — correctness is not applicable until scored. */
  correct: boolean | null;
  autoGraded: boolean;
}

export interface SubmissionDetailDto {
  id: number;
  studentId: number;
  studentName: string;
  initials: string;
  unitTitle: string;
  itemType: SubmissionItemType;
  status: SubmissionListStatus;
  submittedAt: string;
  score: number | null;
  autoScore: number | null;
  manualScore: number | null;
  teacherComment: string | null;
  /** Present for test-type submissions only. */
  questions: SubmissionQuestionReviewDto[] | null;
  /** Present for speaking-type submissions only. */
  speakingPrompt: string | null;
}

export interface GradeSubmissionResultDto {
  submission: SubmissionDetailDto;
  /** The next item the sidebar should jump to for "Saqlash va keyingisi" —
      null once the queue is empty. */
  nextPendingId: number | null;
}
