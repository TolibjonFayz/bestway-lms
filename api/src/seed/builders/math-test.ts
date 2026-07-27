import { Rng } from '../rng';
import { question, SeedQuestion } from './question-types';

/* Real arithmetic with computed answers. Distractors reproduce the mistakes
   students actually make — ignoring operator precedence, adding denominators,
   dropping a sign — so a wrong answer is informative rather than random. */

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function fraction(numerator: number, denominator: number): string {
  const divisor = gcd(numerator, denominator) || 1;
  const n = numerator / divisor;
  const d = denominator / divisor;
  return d === 1 ? String(n) : `${n}/${d}`;
}

function unique(correct: string, candidates: string[]): string[] {
  const seen = new Set([correct]);
  const out: string[] = [];
  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    out.push(candidate);
    if (out.length === 3) break;
  }
  /* Pad from a nearby value if the mistake models happened to collide. */
  let filler = Number(correct.replace(/\D/g, '')) || 10;
  while (out.length < 3) {
    filler += 1;
    if (!seen.has(String(filler))) {
      seen.add(String(filler));
      out.push(String(filler));
    }
  }
  return out;
}

/** Unit 1 — order of operations on whole numbers. */
function orderOfOperations(rng: Rng): SeedQuestion {
  const a = rng.int(2, 19);
  const b = rng.int(2, 12);
  const c = rng.int(2, 9);
  const correct = a + b * c;
  return question(
    `Hisoblang: ${a} + ${b} × ${c}`,
    String(correct),
    unique(String(correct), [
      String((a + b) * c), // ignored precedence
      String(a + b + c),
      String(a * b + c),
    ]),
  );
}

/** Unit 2 — adding two proper fractions. */
function addFractions(rng: Rng): SeedQuestion {
  const b = rng.pick([2, 3, 4, 5, 6, 8]);
  const d = rng.pick([3, 4, 5, 6, 7, 9]);
  const a = rng.int(1, b - 1);
  const c = rng.int(1, d - 1);
  const correct = fraction(a * d + c * b, b * d);
  return question(
    `Hisoblang: ${a}/${b} + ${c}/${d}`,
    correct,
    unique(correct, [
      fraction(a + c, b + d), // added across
      fraction(a * c, b * d),
      fraction(a * d - c * b, b * d),
    ]),
  );
}

/** Unit 2 — percentage of a whole number. */
function percentOf(rng: Rng): SeedQuestion {
  const percent = rng.pick([5, 10, 12, 15, 20, 25, 40, 60, 75]);
  const total = rng.pick([80, 120, 160, 200, 240, 300, 400, 500]);
  const correct = (percent * total) / 100;
  return question(
    `${total} sonining ${percent}% i nechaga teng?`,
    String(correct),
    unique(String(correct), [
      String(total / percent),
      String(correct * 10),
      String(total - correct),
    ]),
  );
}

/** Unit 3 — collecting like terms. */
function simplifyTerms(rng: Rng): SeedQuestion {
  const a = rng.int(2, 12);
  const b = rng.int(2, 9);
  const c = rng.int(1, Math.min(a + b - 1, 8));
  const correct = a + b - c;
  return question(
    `Ixchamlang: ${a}x + ${b}x − ${c}x`,
    `${correct}x`,
    unique(`${correct}x`, [
      `${a + b + c}x`, // sign dropped
      `${a + b - c}x²`,
      `${a * b - c}x`,
    ]),
  );
}

/** Unit 4 — one-step and two-step linear equations. */
function linearEquation(rng: Rng): SeedQuestion {
  const a = rng.int(2, 9);
  const x = rng.int(2, 15);
  const b = rng.int(1, 25);
  const c = a * x + b;
  const correct = x;
  return question(
    `Tenglamani yeching: ${a}x + ${b} = ${c}`,
    String(correct),
    unique(String(correct), [
      String(c / a), // forgot to subtract b
      String(c - b),
      String(Math.round((c + b) / a)),
    ]),
  );
}

const GENERATORS_BY_UNIT: ((rng: Rng) => SeedQuestion)[][] = [
  [orderOfOperations],
  [addFractions, percentOf],
  [simplifyTerms],
  [linearEquation],
];

export function buildMathTest(unitIndex: number, rng: Rng): SeedQuestion[] {
  const generators =
    GENERATORS_BY_UNIT[unitIndex] ?? GENERATORS_BY_UNIT[GENERATORS_BY_UNIT.length - 1];

  const questions: SeedQuestion[] = [];
  const seen = new Set<string>();
  /* Generators can repeat themselves; keep drawing until ten prompts differ. */
  while (questions.length < 10) {
    const built = generators[questions.length % generators.length](rng);
    if (seen.has(built.prompt)) continue;
    seen.add(built.prompt);
    questions.push(built);
  }
  return questions;
}
