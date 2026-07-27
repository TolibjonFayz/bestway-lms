import { WordEntry } from '../data/ielts-vocabulary';
import { Rng } from '../rng';
import { question, SeedQuestion } from './question-types';

/* Questions are derived from the unit's own hand-written word bank rather than
   invented separately: the distractors are real meanings of other words in the
   same unit, which is exactly what a vocabulary check should test. */
export function buildVocabularyTest(
  bank: readonly WordEntry[],
  rng: Rng,
): SeedQuestion[] {
  const chosen = rng.sample(bank, 10);

  return chosen.map((entry, index) => {
    const [en, uz, , example] = entry;
    const others = bank.filter((candidate) => candidate[0] !== en);

    /* Six meaning checks, then four gap-fills — the mix a teacher would set. */
    if (index < 6) {
      const distractors = rng.sample(others, 3).map(([, meaning]) => meaning);
      return question(`"${en}" soʻzining maʼnosi nima?`, uz, distractors);
    }

    const blanked = blankOut(example, en);
    const distractors = rng.sample(others, 3).map(([word]) => word);
    return question(blanked, en, distractors);
  });
}

/* Hides the target word wherever it appears, including the inflected forms the
   examples use ("practise" → "practises"), so the gap is never guessable from
   a leftover stem. */
function blankOut(sentence: string, word: string): string {
  const stem = word.replace(/e$/, '');
  const pattern = new RegExp(`\\b${stem}\\w*\\b`, 'gi');
  const gapped = sentence.replace(pattern, '_____');
  return `Boʻsh joyni toʻldiring: ${gapped}`;
}
