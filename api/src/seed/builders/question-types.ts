import { QuestionType } from '@/common/enums';

export interface SeedOption {
  text: string;
  isCorrect: boolean;
  /** Matching only: the right-hand term `text` must be paired with. */
  matchText?: string;
}

export interface SeedQuestion {
  type: QuestionType;
  prompt: string;
  explanation?: string;
  options: SeedOption[];
}

/** Multiple choice: correct answer first; the caller shuffles before writing. */
export function question(
  prompt: string,
  correct: string,
  distractors: string[],
  explanation?: string,
): SeedQuestion {
  return {
    type: QuestionType.MultipleChoice,
    prompt,
    explanation,
    options: [
      { text: correct, isCorrect: true },
      ...distractors.map((text) => ({ text, isCorrect: false })),
    ],
  };
}

/* Free text instead of a radio pick. `options` still carries the full word
   bank (correct answer included) — that is what the client shows as chips
   under the input — but grading compares typed text to the correct entry,
   not an option id. */
export function fillBlank(
  prompt: string,
  correct: string,
  distractors: string[],
  explanation?: string,
): SeedQuestion {
  return {
    type: QuestionType.FillBlank,
    prompt,
    explanation,
    options: [
      { text: correct, isCorrect: true },
      ...distractors.map((text) => ({ text, isCorrect: false })),
    ],
  };
}

/* Pair matching. Every stored pair is, by construction, a correct pairing —
   there is no "wrong pair" row. Wrongness only exists in what the student
   submits: a left term paired with the wrong right-hand text. */
export function matching(
  prompt: string,
  pairs: [left: string, right: string][],
  explanation?: string,
): SeedQuestion {
  return {
    type: QuestionType.Matching,
    prompt,
    explanation,
    options: pairs.map(([text, matchText]) => ({
      text,
      matchText,
      isCorrect: true,
    })),
  };
}

/* No machine-checkable answer and no options at all — always waits for a
   teacher, which is exactly the case the homework review screen exists to
   handle. */
export function openQuestion(prompt: string): SeedQuestion {
  return { type: QuestionType.Open, prompt, options: [] };
}
