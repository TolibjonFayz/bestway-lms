export interface SeedOption {
  text: string;
  isCorrect: boolean;
}

export interface SeedQuestion {
  prompt: string;
  options: SeedOption[];
}

/** Correct answer first; the caller shuffles before writing to the database. */
export function question(
  prompt: string,
  correct: string,
  distractors: string[],
): SeedQuestion {
  return {
    prompt,
    options: [
      { text: correct, isCorrect: true },
      ...distractors.map((text) => ({ text, isCorrect: false })),
    ],
  };
}
