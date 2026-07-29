/** Mastery bands the word list paints as dots. */
export type MasteryState = 'new' | 'learning' | 'mastered';

export interface VocabWordDto {
  id: number;
  wordEn: string;
  wordUz: string;
  transcription: string | null;
  exampleEn: string | null;
  /** 0–3; three correct answers reach "yodlangan". */
  level: number;
  state: MasteryState;
}

export interface VocabSetDto {
  lessonItemId: number;
  unitId: number;
  title: string;
  total: number;
  mastered: number;
  /** Mastered ÷ total, the figure stored as this item's progress. */
  percent: number;
  /** True once every word is mastered — drives the completion screen. */
  completed: boolean;
  coinsEarned: number;
  words: VocabWordDto[];
}

export interface VocabAnswerResult {
  vocabWordId: number;
  level: number;
  state: MasteryState;
  total: number;
  mastered: number;
  percent: number;
  completed: boolean;
  coinsAwarded: number;
  coinsAlreadyHeld: boolean;
}
