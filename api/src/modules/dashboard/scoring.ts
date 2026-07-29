import { Submission } from '@/database/models';

/* Coins now come from the real ledger (gamification/coins.service.ts), so this
   file no longer derives them — CoinsService.totalFor() is the only source.

   points still has no table of its own: it is the sum of every graded mark the
   student has earned, computed here in one place. */
export const PASS_THRESHOLD = 60;

/** The mark that counts: a teacher's override beats the machine's. */
export function effectiveScore(submission: Submission): number | null {
  return submission.manualScore ?? submission.autoScore ?? null;
}

/* Retakes are allowed but only the highest score per lesson item counts
   toward the total — summing every submission as-is would let a student
   inflate their points just by resubmitting the same test. */
export function totalPoints(submissions: Submission[]): number {
  const bestByItem = new Map<number, number>();
  for (const submission of submissions) {
    const score = effectiveScore(submission);
    if (score === null) continue;
    const current = bestByItem.get(submission.lessonItemId) ?? -1;
    if (score > current) bestByItem.set(submission.lessonItemId, score);
  }
  return [...bestByItem.values()].reduce((sum, score) => sum + score, 0);
}

