import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LessonItemType } from '@/common/enums';
import {
  CoinReason,
  LessonItem,
  MASTERED_LEVEL,
  Progress,
  VocabWord,
  VocabWordProgress,
} from '@/database/models';
import { CoinsService } from '../gamification/coins.service';
import {
  MasteryState,
  VocabAnswerResult,
  VocabSetDto,
  VocabWordDto,
} from './vocabulary.types';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectModel(LessonItem) private readonly lessonItems: typeof LessonItem,
    @InjectModel(VocabWord) private readonly words: typeof VocabWord,
    @InjectModel(VocabWordProgress)
    private readonly wordProgress: typeof VocabWordProgress,
    @InjectModel(Progress) private readonly progress: typeof Progress,
    private readonly coins: CoinsService,
  ) {}

  /** The whole word set for a unit's vocabulary item, with this student's mastery. */
  async wordsForUnit(studentId: number, unitId: number): Promise<VocabSetDto> {
    const item = await this.lessonItems.findOne({
      where: { unitId, type: LessonItemType.Vocabulary },
    });
    if (!item) {
      /* Maths and science units legitimately have none — say so plainly
         rather than returning an empty set that looks like a bug. */
      throw new NotFoundException('Bu unitda lugʻat mashqi yoʻq');
    }

    const [words, levels] = await Promise.all([
      this.words.findAll({
        where: { lessonItemId: item.id },
        order: [['orderIndex', 'ASC']],
      }),
      this.levelMap(studentId, item.id),
    ]);

    const dtos: VocabWordDto[] = words.map((word) => {
      const level = levels.get(word.id) ?? 0;
      return {
        id: word.id,
        wordEn: word.wordEn,
        wordUz: word.wordUz,
        transcription: word.transcription,
        exampleEn: word.exampleEn,
        level,
        state: this.stateFor(level),
      };
    });

    const mastered = dtos.filter((word) => word.level >= MASTERED_LEVEL).length;
    const percent = dtos.length
      ? Math.round((mastered / dtos.length) * 100)
      : 0;

    return {
      lessonItemId: item.id,
      unitId,
      title: item.title,
      total: dtos.length,
      mastered,
      percent,
      completed: dtos.length > 0 && mastered === dtos.length,
      coinsEarned: 0,
      words: dtos,
    };
  }

  /* One flashcard answer. A correct answer climbs a level, a wrong one drops
     one — so a word the student stops recalling falls back out of "yodlangan"
     instead of staying learnt forever. */
  async answer(
    studentId: number,
    vocabWordId: number,
    correct: boolean,
  ): Promise<VocabAnswerResult> {
    const word = await this.words.findByPk(vocabWordId);
    if (!word) throw new NotFoundException('Soʻz topilmadi');

    const [row] = await this.wordProgress.findOrCreate({
      where: { studentId, vocabWordId },
      defaults: {
        studentId,
        vocabWordId,
        level: 0,
        correctCount: 0,
        wrongCount: 0,
      } as Partial<VocabWordProgress> as VocabWordProgress,
    });

    const level = correct
      ? Math.min(MASTERED_LEVEL, row.level + 1)
      : Math.max(0, row.level - 1);

    await row.update({
      level,
      correctCount: row.correctCount + (correct ? 1 : 0),
      wrongCount: row.wrongCount + (correct ? 0 : 1),
      lastAnsweredAt: new Date(),
    });

    const summary = await this.recalculate(studentId, word.lessonItemId);

    let coinsAwarded = 0;
    let coinsAlreadyHeld = false;
    if (summary.completed) {
      const award = await this.coins.award(
        studentId,
        word.lessonItemId,
        CoinReason.VocabularyCompleted,
      );
      coinsAwarded = award.awarded;
      coinsAlreadyHeld = !award.isNew;
    }

    return {
      vocabWordId,
      level,
      state: this.stateFor(level),
      ...summary,
      coinsAwarded,
      coinsAlreadyHeld,
    };
  }

  /* Rewrites the vocabulary item's overall progress from its words, so the
     unit roadmap and the trainer never disagree. */
  private async recalculate(
    studentId: number,
    lessonItemId: number,
  ): Promise<{
    total: number;
    mastered: number;
    percent: number;
    completed: boolean;
  }> {
    const [total, levels] = await Promise.all([
      this.words.count({ where: { lessonItemId } }),
      this.levelMap(studentId, lessonItemId),
    ]);

    const mastered = [...levels.values()].filter(
      (level) => level >= MASTERED_LEVEL,
    ).length;
    const percent = total ? Math.round((mastered / total) * 100) : 0;
    const completed = total > 0 && mastered === total;

    const existing = await this.progress.findOne({
      where: { studentId, lessonItemId },
    });
    if (existing) {
      await existing.update({
        percent,
        completedAt: completed ? (existing.completedAt ?? new Date()) : null,
      });
    } else {
      await this.progress.create({
        studentId,
        lessonItemId,
        percent,
        completedAt: completed ? new Date() : null,
      } as Partial<Progress> as Progress);
    }

    return { total, mastered, percent, completed };
  }

  private async levelMap(
    studentId: number,
    lessonItemId: number,
  ): Promise<Map<number, number>> {
    const rows = await this.wordProgress.findAll({
      where: { studentId },
      include: [
        {
          model: VocabWord,
          as: 'word',
          attributes: ['id'],
          where: { lessonItemId },
          required: true,
        },
      ],
    });
    return new Map(rows.map((row) => [row.vocabWordId, row.level]));
  }

  private stateFor(level: number): MasteryState {
    if (level >= MASTERED_LEVEL) return 'mastered';
    return level > 0 ? 'learning' : 'new';
  }
}
