import { QuestionType } from '@/common/enums';

export interface TestOptionDto {
  id: number;
  text: string;
}

export interface TestQuestionDto {
  id: number;
  orderIndex: number;
  type: QuestionType;
  prompt: string;
  /** multiple_choice (radio) / fill_blank (word-bank chips). */
  options?: TestOptionDto[];
  /** matching: left keeps its option id, right is a shuffled, id-less list of
      terms — so proximity or position never leaks the pairing. */
  left?: TestOptionDto[];
  right?: string[];
}

export interface TestAttemptDto {
  lessonItemId: number;
  unitTitle: string;
  passScore: number;
  timeLimitSeconds: number | null;
  remainingSeconds: number | null;
  startedAt: string;
  totalQuestions: number;
  questions: TestQuestionDto[];
  /** Whatever has been saved to the draft so far, keyed by question id. */
  answers: Record<string, unknown>;
}

export interface TestResultQuestionDto {
  id: number;
  orderIndex: number;
  type: QuestionType;
  prompt: string;
  correct: boolean;
  /** Safe to reveal now — grading has already happened. */
  correctAnswerText: string;
  explanation: string | null;
  /** open questions only: true until a teacher assigns the overall score. */
  needsReview: boolean;
}

export interface TestResultDto {
  lessonItemId: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passScore: number;
  passed: boolean;
  /** The highest score ever recorded for this item, across every attempt. */
  bestScore: number;
  /** How much this submission actually added to the dashboard's point total
      — 0 on a retake that did not beat the previous best. */
  pointsContributed: number;
  coinsAwarded: number;
  coinsAlreadyHeld: boolean;
  submittedAt: string;
  questions: TestResultQuestionDto[];
}

export type TestStateDto =
  | { mode: 'taking'; attempt: TestAttemptDto }
  | { mode: 'result'; result: TestResultDto }
  /* Contains at least one open question and a teacher has not graded it yet
     — the student can neither retake (they already have an attempt in) nor
     see a score (there isn't one). */
  | { mode: 'pending' };
