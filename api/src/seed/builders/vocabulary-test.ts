import { WordEntry } from '../data/ielts-vocabulary';
import { Rng } from '../rng';
import { fillBlank, matching, openQuestion, question, SeedQuestion } from './question-types';

const MC_COUNT = 6;
const FILL_BLANK_COUNT = 2;
const MATCH_PAIR_COUNT = 4;
const OPEN_COUNT = 1;

/* Questions are derived from the unit's own hand-written word bank rather than
   invented separately: the distractors are real meanings of other words in the
   same unit, which is exactly what a vocabulary check should test. Four
   question types exercise the same bank: meaning checks (multiple choice),
   gap-fills (free text), a translation-pairing question (matching) and a
   short-writing prompt (open) — the one type with no machine-checkable
   answer, always routed to the teacher's grading queue. */
export function buildVocabularyTest(
  bank: readonly WordEntry[],
  rng: Rng,
): SeedQuestion[] {
  const chosen = rng.sample(bank, MC_COUNT + FILL_BLANK_COUNT + MATCH_PAIR_COUNT + OPEN_COUNT);
  const mcWords = chosen.slice(0, MC_COUNT);
  const fillWords = chosen.slice(MC_COUNT, MC_COUNT + FILL_BLANK_COUNT);
  const matchWords = chosen.slice(MC_COUNT + FILL_BLANK_COUNT, MC_COUNT + FILL_BLANK_COUNT + MATCH_PAIR_COUNT);
  const [openWord] = chosen.slice(MC_COUNT + FILL_BLANK_COUNT + MATCH_PAIR_COUNT);

  const questions: SeedQuestion[] = [];

  for (const [en, uz] of mcWords) {
    const others = bank.filter((candidate) => candidate[0] !== en);
    const distractors = rng.sample(others, 3).map(([, meaning]) => meaning);
    questions.push(question(`"${en}" soʻzining maʼnosi nima?`, uz, distractors));
  }

  for (const [en, , , example] of fillWords) {
    const others = bank.filter((candidate) => candidate[0] !== en);
    const blanked = blankOut(example, en);
    const distractors = rng.sample(others, 3).map(([word]) => word);
    questions.push(
      fillBlank(
        blanked,
        en,
        distractors,
        `Toʻgʻri javob: ${en} — gap maʼnosiga mos soʻz shakli.`,
      ),
    );
  }

  questions.push(
    matching(
      'Soʻzlarni tarjimasi bilan mosla',
      matchWords.map(([en, uz]) => [en, uz]),
    ),
  );

  if (openWord) {
    const [en] = openWord;
    questions.push(
      openQuestion(`Insho: "${en}" soʻzini ishlatib, 3-4 gapdan iborat qisqa matn yozing.`),
    );
  }

  return questions;
}

/* Hides the target word wherever it appears, including the inflected forms the
   examples use ("practise" → "practises"), so the gap is never guessable from
   a leftover stem. The client's fill_blank section already carries its own
   "Boʻshliqni toʻldiring" label, so the prompt is just the gapped sentence. */
function blankOut(sentence: string, word: string): string {
  const stem = word.replace(/e$/, '');
  const pattern = new RegExp(`\\b${stem}\\w*\\b`, 'gi');
  return sentence.replace(pattern, '_____');
}
