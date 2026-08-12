import { MasteryState } from '../vocabulary/vocabulary.types';
import { TestQuestionDto } from '../tests/tests.types';

export interface PracticeSummaryDto {
  /** Words below mastery across every unit the student has started. */
  wordsDue: number;
  /** Questions they have answered wrongly in a graded attempt. */
  mistakeCount: number;
}

export interface PracticeWordDto {
  id: number;
  wordEn: string;
  wordUz: string;
  transcription: string | null;
  exampleEn: string | null;
  level: number;
  state: MasteryState;
  /** Which unit it came from, so the card can say where it is from. */
  unitTitle: string;
}

export interface PracticeMistakeDto {
  question: TestQuestionDto;
  unitTitle: string;
  /** What they answered last time, for the "you said" line after checking. */
  previousAnswer: unknown;
}
