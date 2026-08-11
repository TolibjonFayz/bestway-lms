import { CourseSubject, LessonItemType, QuestionType } from '@/common/enums';

export interface AdminCourseDto {
  id: number;
  name: string;
  subject: CourseSubject;
  description: string | null;
  unitCount: number;
}

export interface AdminUnitDto {
  id: number;
  orderIndex: number;
  title: string;
}

export interface AdminLessonItemDto {
  id: number;
  orderIndex: number;
  type: LessonItemType;
  title: string;
  /** Canonical stored source; empty string on a video item with none set yet. */
  videoUrl: string | null;
  videoDurationSeconds: number | null;
  vocabWordCount: number | null;
  testQuestionCount: number | null;
}

export interface AdminUnitDetailDto {
  id: number;
  courseId: number;
  subject: CourseSubject;
  title: string;
  items: AdminLessonItemDto[];
}

export interface AdminVocabWordDto {
  id: number;
  orderIndex: number;
  wordEn: string;
  wordUz: string;
  transcription: string | null;
  exampleEn: string | null;
}

export interface AdminQuestionOptionDto {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface AdminQuestionDto {
  id: number;
  orderIndex: number;
  type: QuestionType;
  prompt: string;
  /** Only ever populated for multiple_choice — the only type this editor
      writes. Other types come from the seed and are shown read-only. */
  options: AdminQuestionOptionDto[];
  editable: boolean;
}
