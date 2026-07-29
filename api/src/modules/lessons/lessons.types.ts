import { CourseSubject, LessonItemType } from '@/common/enums';

export type UnitStatus = 'completed' | 'current' | 'available' | 'locked';

export interface CourseSummaryDto {
  id: number;
  name: string;
  subject: CourseSubject;
  description: string | null;
  coverUrl: string | null;
  teacherName: string | null;
  unitCount: number;
  completedUnits: number;
  /** Whole percent across every lesson item in the course. */
  percent: number;
}

export interface UnitItemSummaryDto {
  id: number;
  type: LessonItemType;
  title: string;
  percent: number;
  /** Chip caption suffix, e.g. "39 soʻz" or "10 ta savol". */
  meta: string | null;
}

export interface UnitSummaryDto {
  id: number;
  orderIndex: number;
  /** "Unit 5.2" — the numbering, split off the stored title. */
  code: string;
  /** "Present Perfect" — the title without its numbering. */
  title: string;
  percent: number;
  status: UnitStatus;
  locked: boolean;
  items: UnitItemSummaryDto[];
}

export interface VideoPayloadDto {
  url: string;
  durationSeconds: number;
  thumbnailUrl: string | null;
  watched: boolean;
  /** Plain-text summary bullets for the collapsible Konspekt section. */
  konspekt: string[];
}

export interface VocabularyPayloadDto {
  wordCount: number;
  /** First few pairs, for the collapsed preview list. */
  preview: { wordEn: string; wordUz: string }[];
}

export interface TestPayloadDto {
  questionCount: number;
  passScore: number;
  attemptsAllowed: number;
  /** Best effective score so far, null when never submitted. */
  score: number | null;
  attemptsUsed: number;
}

export interface SpeakingPayloadDto {
  prompt: string;
  part: number | null;
  maxDurationSeconds: number | null;
  submitted: boolean;
}

export interface UnitItemDetailDto extends UnitItemSummaryDto {
  video?: VideoPayloadDto;
  vocabulary?: VocabularyPayloadDto;
  test?: TestPayloadDto;
  speaking?: SpeakingPayloadDto;
}

export interface UnitDetailDto {
  id: number;
  courseId: number;
  courseName: string;
  subject: CourseSubject;
  orderIndex: number;
  code: string;
  title: string;
  percent: number;
  status: UnitStatus;
  locked: boolean;
  items: UnitItemDetailDto[];
}
