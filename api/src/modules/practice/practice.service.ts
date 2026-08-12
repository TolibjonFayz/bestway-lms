import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { LessonItemType } from '@/common/enums';
import {
  LessonItem,
  MASTERED_LEVEL,
  Question,
  QuestionOption,
  Unit,
  VocabWord,
  VocabWordProgress,
} from '@/database/models';
import { TestsService } from '../tests/tests.service';
import { VocabularyService } from '../vocabulary/vocabulary.service';
import { MasteryState } from '../vocabulary/vocabulary.types';
import {
  PracticeMistakeDto,
  PracticeSummaryDto,
  PracticeWordDto,
} from './practice.types';

/** How much of each kind one practice session offers. */
const VOCAB_SESSION_SIZE = 20;
const MISTAKE_SESSION_SIZE = 15;

@Injectable()
export class PracticeService {
  constructor(
    @InjectModel(VocabWord) private readonly words: typeof VocabWord,
    @InjectModel(VocabWordProgress)
    private readonly wordProgress: typeof VocabWordProgress,
    @InjectModel(LessonItem) private readonly lessonItems: typeof LessonItem,
    @InjectModel(Unit) private readonly units: typeof Unit,
    @InjectModel(Question) private readonly questions: typeof Question,
    private readonly vocabulary: VocabularyService,
    private readonly tests: TestsService,
  ) {}

  async summary(studentId: number): Promise<PracticeSummaryDto> {
    const [words, mistakes] = await Promise.all([
      this.dueWords(studentId, VOCAB_SESSION_SIZE),
      this.tests.wrongQuestionsFor(studentId, MISTAKE_SESSION_SIZE),
    ]);
    return { wordsDue: words.length, mistakeCount: mistakes.length };
  }

  async vocabSession(studentId: number): Promise<PracticeWordDto[]> {
    return this.dueWords(studentId, VOCAB_SESSION_SIZE);
  }

  async mistakeSession(studentId: number): Promise<PracticeMistakeDto[]> {
    const rows = await this.tests.wrongQuestionsFor(studentId, MISTAKE_SESSION_SIZE);
    return rows.map((row) => ({
      question: this.tests.toClientQuestion(row.question, row.seed),
      unitTitle: row.unitTitle,
      previousAnswer: row.previousAnswer,
    }));
  }

  /* Practice answers go through the ordinary vocabulary path: a word drilled
     here should move up the same mastery ladder as one drilled in the unit.
     Coin awards there are already idempotent per lesson item, so practising a
     finished set cannot mint a second payout. */
  answerWord(studentId: number, vocabWordId: number, correct: boolean) {
    return this.vocabulary.answer(studentId, vocabWordId, correct);
  }

  /** Checks a practice answer without recording a submission — the student's
      real test score is not affected by practising. */
  async checkMistake(
    studentId: number,
    questionId: number,
    answer: unknown,
  ): Promise<{ correct: boolean; correctAnswerText: string; explanation: string | null }> {
    const rows = await this.tests.wrongQuestionsFor(studentId, MISTAKE_SESSION_SIZE);
    const row = rows.find((entry) => entry.question.id === questionId);
    /* Only questions in this student's own mistake set are checkable, so the
       endpoint cannot be used to reveal answers for an unattempted test. */
    if (!row) throw new NotFoundException('Savol topilmadi');

    const result = this.tests.checkAnswer(row.question, answer);
    return {
      correct: result.correct,
      correctAnswerText: result.correctAnswerText,
      explanation: row.question.explanation,
    };
  }

  /** Words below mastery, weakest first, across every vocabulary set the
      student has already touched. */
  private async dueWords(studentId: number, limit: number): Promise<PracticeWordDto[]> {
    const progressRows = await this.wordProgress.findAll({
      where: { studentId },
      order: [
        ['level', 'ASC'],
        ['lastAnsweredAt', 'ASC'],
      ],
    });
    const started = progressRows.filter((row) => row.level < MASTERED_LEVEL);
    if (!started.length) return [];

    const words = await this.words.findAll({
      where: { id: { [Op.in]: started.map((row) => row.vocabWordId) } },
    });
    const wordById = new Map(words.map((word) => [word.id, word]));

    const items = await this.lessonItems.findAll({
      where: {
        id: { [Op.in]: [...new Set(words.map((word) => word.lessonItemId))] },
        type: LessonItemType.Vocabulary,
      },
    });
    const itemById = new Map(items.map((item) => [item.id, item]));

    const units = await this.units.findAll({
      where: { id: { [Op.in]: [...new Set(items.map((item) => item.unitId))] } },
    });
    const unitTitleById = new Map(units.map((unit) => [unit.id, unit.title]));

    const out: PracticeWordDto[] = [];
    for (const row of started) {
      if (out.length >= limit) break;
      const word = wordById.get(row.vocabWordId);
      const item = word ? itemById.get(word.lessonItemId) : undefined;
      if (!word || !item) continue;

      out.push({
        id: word.id,
        wordEn: word.wordEn,
        wordUz: word.wordUz,
        transcription: word.transcription ?? null,
        exampleEn: word.exampleEn ?? null,
        level: row.level,
        state: this.stateFor(row.level),
        unitTitle: unitTitleById.get(item.unitId) ?? '',
      });
    }
    return out;
  }

  private stateFor(level: number): MasteryState {
    if (level >= MASTERED_LEVEL) return 'mastered';
    return level > 0 ? 'learning' : 'new';
  }
}
