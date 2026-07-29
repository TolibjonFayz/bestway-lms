import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { LessonItemType, QuestionType, SubmissionStatus } from '@/common/enums';
import {
  CoinReason,
  LessonItem,
  Progress,
  Question,
  QuestionOption,
  Submission,
  Test,
  Unit,
} from '@/database/models';
import { CoinsService } from '../gamification/coins.service';
import { seededShuffle } from './shuffle';
import {
  TestAttemptDto,
  TestQuestionDto,
  TestResultDto,
  TestResultQuestionDto,
  TestStateDto,
} from './tests.types';

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

interface GradeResult {
  pointsEarned: number;
  correct: boolean;
  correctAnswerText: string;
}

@Injectable()
export class TestsService {
  constructor(
    @InjectModel(LessonItem) private readonly lessonItems: typeof LessonItem,
    @InjectModel(Unit) private readonly units: typeof Unit,
    @InjectModel(Test) private readonly tests: typeof Test,
    @InjectModel(Question) private readonly questions: typeof Question,
    @InjectModel(Submission) private readonly submissions: typeof Submission,
    @InjectModel(Progress) private readonly progress: typeof Progress,
    private readonly coins: CoinsService,
  ) {}

  /** Resumes the in-progress attempt, shows the last result, or starts a
      brand-new attempt — whichever applies for this student and item. */
  async getState(studentId: number, lessonItemId: number): Promise<TestStateDto> {
    const { item, test } = await this.loadTest(lessonItemId);
    const questions = await this.loadQuestions(test.id);

    const draft = await this.findDraft(studentId, lessonItemId);
    if (draft) {
      const unitTitle = await this.unitTitleFor(item.unitId);
      return { mode: 'taking', attempt: this.attemptDto(draft, test, unitTitle, questions) };
    }

    if (await this.findPending(studentId, lessonItemId)) {
      return { mode: 'pending' };
    }

    const last = await this.lastGraded(studentId, lessonItemId);
    if (last) {
      return { mode: 'result', result: await this.resultDto(studentId, test, last, questions) };
    }

    const created = await this.createDraft(studentId, lessonItemId);
    const unitTitle = await this.unitTitleFor(item.unitId);
    return { mode: 'taking', attempt: this.attemptDto(created, test, unitTitle, questions) };
  }

  /** Persists whatever the student has answered so far — this is what makes
      a reload or a dropped connection non-destructive. */
  async saveAnswers(
    studentId: number,
    lessonItemId: number,
    answers: Record<string, unknown>,
  ): Promise<{ savedAt: string }> {
    await this.loadTest(lessonItemId);
    const draft = await this.activeDraft(studentId, lessonItemId);
    await draft.update({ answers });
    return { savedAt: new Date().toISOString() };
  }

  /* Grading happens entirely here, server-side, from the stored correct
     answers — the DTOs sent out before this point never include them. Coins
     are paid only the first time a student ever finishes this test, and only
     if that first attempt passes; every later resubmission still updates the
     record (so "highest score counts") but never pays out again. */
  async submit(
    studentId: number,
    lessonItemId: number,
    answers: Record<string, unknown>,
  ): Promise<TestResultDto> {
    const { test } = await this.loadTest(lessonItemId);
    const questions = await this.loadQuestions(test.id);
    const draft = await this.activeDraft(studentId, lessonItemId);

    const previousBest = await this.bestScore(studentId, lessonItemId);
    const { score, correctCount, review, hasOpenQuestions } = this.evaluate(questions, answers);
    const passed = score >= test.passScore;

    /* A test with an open question can never fully auto-grade — it goes to
       the teacher queue instead, same status a speaking submission gets.
       autoScore still records the auto-gradable portion so the teacher sees
       it, but nothing about progress or coins is final until they grade it. */
    await draft.update({
      answers,
      autoScore: score,
      status: hasOpenQuestions ? SubmissionStatus.Submitted : SubmissionStatus.Graded,
      submittedAt: new Date(),
      gradedAt: hasOpenQuestions ? null : new Date(),
    });

    let coinsAwarded = 0;
    let coinsAlreadyHeld = previousBest !== null;
    if (!hasOpenQuestions) {
      await this.markItemComplete(studentId, lessonItemId);
      if (previousBest === null && passed) {
        const award = await this.coins.award(studentId, lessonItemId, CoinReason.TestCompleted);
        coinsAwarded = award.awarded;
        coinsAlreadyHeld = !award.isNew;
      }
    }

    return {
      lessonItemId,
      score,
      correctCount,
      totalQuestions: questions.length,
      passScore: test.passScore,
      passed,
      bestScore: Math.max(score, previousBest ?? 0),
      pointsContributed: hasOpenQuestions ? 0 : Math.max(0, score - (previousBest ?? 0)),
      coinsAwarded,
      coinsAlreadyHeld,
      submittedAt: new Date().toISOString(),
      questions: review,
    };
  }

  /** Starts a fresh attempt over a finished one. Retakes are unlimited, but
      only ever raise the recorded best — never award coins a second time. */
  async retake(studentId: number, lessonItemId: number): Promise<TestAttemptDto> {
    if (await this.findPending(studentId, lessonItemId)) {
      throw new BadRequestException('Oldingi urinish hali oʻqituvchi tomonidan tekshirilmoqda');
    }

    const { item, test } = await this.loadTest(lessonItemId);
    const questions = await this.loadQuestions(test.id);
    const unitTitle = await this.unitTitleFor(item.unitId);

    /* Already mid-attempt — resume it rather than orphaning a second draft. */
    const draft =
      (await this.findDraft(studentId, lessonItemId)) ??
      (await this.createDraft(studentId, lessonItemId));

    return this.attemptDto(draft, test, unitTitle, questions);
  }

  /** Runs the same "test just finished" side-effects submit() applies for an
      auto-only test — called by the teacher grading flow once a test that
      had an open question finally gets its manual score. Coins only pay out
      the first time this item is ever finished, and only if it passes. */
  async finalizeManualGrade(
    studentId: number,
    lessonItemId: number,
    submissionId: number,
    finalScore: number,
  ): Promise<void> {
    const test = await this.tests.findOne({ where: { lessonItemId } });
    const passScore = test?.passScore ?? 60;

    await this.markItemComplete(studentId, lessonItemId);

    const priorGraded = await this.submissions.count({
      where: {
        studentId,
        lessonItemId,
        status: { [Op.in]: [SubmissionStatus.Graded, SubmissionStatus.Returned] },
        id: { [Op.ne]: submissionId },
      },
    });
    if (priorGraded === 0 && finalScore >= passScore) {
      await this.coins.award(studentId, lessonItemId, CoinReason.TestCompleted);
    }
  }

  private async loadTest(lessonItemId: number): Promise<{ item: LessonItem; test: Test }> {
    const item = await this.lessonItems.findByPk(lessonItemId);
    if (!item) throw new NotFoundException('Dars elementi topilmadi');
    if (item.type !== LessonItemType.Test) {
      throw new BadRequestException('Bu element test emas');
    }
    const test = await this.tests.findOne({ where: { lessonItemId } });
    if (!test) throw new NotFoundException('Test topilmadi');
    return { item, test };
  }

  private loadQuestions(testId: number): Promise<Question[]> {
    return this.questions.findAll({
      where: { testId },
      include: [{ model: QuestionOption, as: 'options' }],
      order: [
        ['orderIndex', 'ASC'],
        [{ model: QuestionOption, as: 'options' }, 'orderIndex', 'ASC'],
      ],
    });
  }

  private async unitTitleFor(unitId: number): Promise<string> {
    const unit = await this.units.findByPk(unitId);
    return unit?.title ?? '';
  }

  private findDraft(studentId: number, lessonItemId: number): Promise<Submission | null> {
    return this.submissions.findOne({
      where: { studentId, lessonItemId, status: SubmissionStatus.Draft },
    });
  }

  private createDraft(studentId: number, lessonItemId: number): Promise<Submission> {
    return this.submissions.create({
      studentId,
      lessonItemId,
      answers: {},
      status: SubmissionStatus.Draft,
    } as Partial<Submission> as Submission);
  }

  private async activeDraft(studentId: number, lessonItemId: number): Promise<Submission> {
    return (
      (await this.findDraft(studentId, lessonItemId)) ??
      (await this.createDraft(studentId, lessonItemId))
    );
  }

  private findPending(studentId: number, lessonItemId: number): Promise<Submission | null> {
    return this.submissions.findOne({
      where: { studentId, lessonItemId, status: SubmissionStatus.Submitted },
    });
  }

  private lastGraded(studentId: number, lessonItemId: number): Promise<Submission | null> {
    return this.submissions.findOne({
      where: {
        studentId,
        lessonItemId,
        status: { [Op.in]: [SubmissionStatus.Graded, SubmissionStatus.Returned] },
      },
      order: [['submittedAt', 'DESC']],
    });
  }

  /** The highest score across every graded attempt — what "only the highest
      score counts" actually reads from. */
  private async bestScore(studentId: number, lessonItemId: number): Promise<number | null> {
    const rows = await this.submissions.findAll({
      where: {
        studentId,
        lessonItemId,
        status: { [Op.in]: [SubmissionStatus.Graded, SubmissionStatus.Returned] },
      },
      attributes: ['autoScore', 'manualScore'],
    });
    const scores = rows
      .map((row) => row.manualScore ?? row.autoScore)
      .filter((value): value is number => value !== null);
    return scores.length ? Math.max(...scores) : null;
  }

  /* A test item's progress is binary: 0 until finished, 100 once graded —
     unlike video/vocab there is no partial-credit percentage to track here,
     only whether the unit roadmap should count it as done. */
  private async markItemComplete(studentId: number, lessonItemId: number): Promise<void> {
    const existing = await this.progress.findOne({ where: { studentId, lessonItemId } });
    if (existing?.percent === 100) return;
    if (existing) {
      await existing.update({ percent: 100, completedAt: existing.completedAt ?? new Date() });
    } else {
      await this.progress.create({
        studentId,
        lessonItemId,
        percent: 100,
        completedAt: new Date(),
      } as Partial<Progress> as Progress);
    }
  }

  private toPublicQuestion(question: Question, seed: string): TestQuestionDto {
    const base = {
      id: question.id,
      orderIndex: question.orderIndex,
      type: question.type,
      prompt: question.prompt,
    };
    const options = question.options ?? [];

    if (question.type === QuestionType.Matching) {
      return {
        ...base,
        left: options.map((option) => ({ id: option.id, text: option.text })),
        /* Shuffled independently from the left column and seeded off the
           attempt + question, so the pairing cannot be read off position and
           the order still survives a reload of the same attempt. */
        right: seededShuffle(
          options.map((option) => option.matchText ?? ''),
          seed,
        ),
      };
    }

    return {
      ...base,
      options: options.map((option) => ({ id: option.id, text: option.text })),
    };
  }

  private attemptDto(
    draft: Submission,
    test: Test,
    unitTitle: string,
    questions: Question[],
  ): TestAttemptDto {
    const startedAt = draft.createdAt;
    const remainingSeconds =
      test.timeLimitSeconds == null
        ? null
        : Math.max(
            0,
            test.timeLimitSeconds - Math.floor((Date.now() - startedAt.getTime()) / 1000),
          );

    return {
      lessonItemId: test.lessonItemId,
      unitTitle,
      passScore: test.passScore,
      timeLimitSeconds: test.timeLimitSeconds,
      remainingSeconds,
      startedAt: startedAt.toISOString(),
      totalQuestions: questions.length,
      questions: questions.map((q) => this.toPublicQuestion(q, `${draft.id}:${q.id}`)),
      answers: draft.answers,
    };
  }

  private grade(question: Question, rawAnswer: unknown): GradeResult {
    const options = question.options ?? [];

    if (question.type === QuestionType.Matching) {
      const chosen =
        rawAnswer && typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)
          ? (rawAnswer as Record<string, unknown>)
          : {};
      let rightCount = 0;
      for (const option of options) {
        const picked = chosen[String(option.id)];
        if (
          typeof picked === 'string' &&
          normalise(picked) === normalise(option.matchText ?? '')
        ) {
          rightCount += 1;
        }
      }
      const fraction = options.length ? rightCount / options.length : 0;
      const correctAnswerText = options
        .map((option) => `${option.text} — ${option.matchText}`)
        .join('; ');
      return {
        pointsEarned: question.points * fraction,
        correct: options.length > 0 && rightCount === options.length,
        correctAnswerText,
      };
    }

    const correctOption = options.find((option) => option.isCorrect);
    const correctAnswerText = correctOption?.text ?? '';

    if (question.type === QuestionType.FillBlank) {
      const text = typeof rawAnswer === 'string' ? rawAnswer : '';
      const correct = text.length > 0 && normalise(text) === normalise(correctAnswerText);
      return { pointsEarned: correct ? question.points : 0, correct, correctAnswerText };
    }

    const optionId =
      typeof rawAnswer === 'number'
        ? rawAnswer
        : typeof rawAnswer === 'string'
          ? Number(rawAnswer)
          : NaN;
    const correct = Number.isFinite(optionId) && correctOption?.id === optionId;
    return { pointsEarned: correct ? question.points : 0, correct, correctAnswerText };
  }

  private evaluate(
    questions: Question[],
    answers: Record<string, unknown>,
  ): {
    score: number;
    correctCount: number;
    review: TestResultQuestionDto[];
    hasOpenQuestions: boolean;
  } {
    let earned = 0;
    let maxPoints = 0;
    let correctCount = 0;
    let hasOpenQuestions = false;

    const review = questions.map((question) => {
      /* No machine answer to check — excluded from the auto-graded total
         entirely rather than counted as wrong. */
      if (question.type === QuestionType.Open) {
        hasOpenQuestions = true;
        return {
          id: question.id,
          orderIndex: question.orderIndex,
          type: question.type,
          prompt: question.prompt,
          correct: false,
          correctAnswerText: '',
          explanation: question.explanation,
          needsReview: true,
        };
      }

      maxPoints += question.points;
      const graded = this.grade(question, answers[String(question.id)]);
      earned += graded.pointsEarned;
      if (graded.correct) correctCount += 1;
      return {
        id: question.id,
        orderIndex: question.orderIndex,
        type: question.type,
        prompt: question.prompt,
        correct: graded.correct,
        correctAnswerText: graded.correctAnswerText,
        explanation: question.explanation,
        needsReview: false,
      };
    });

    const score = maxPoints ? Math.round((earned / maxPoints) * 100) : 0;
    return { score, correctCount, review, hasOpenQuestions };
  }

  /** Rebuilds the result view for a past graded attempt — used when a
      student revisits a finished test rather than just having submitted it. */
  private async resultDto(
    studentId: number,
    test: Test,
    submission: Submission,
    questions: Question[],
  ): Promise<TestResultDto> {
    const { correctCount, review } = this.evaluate(
      questions,
      submission.answers as Record<string, unknown>,
    );
    const score = submission.manualScore ?? submission.autoScore ?? 0;
    const best = await this.bestScore(studentId, test.lessonItemId);

    return {
      lessonItemId: test.lessonItemId,
      score,
      correctCount,
      totalQuestions: questions.length,
      passScore: test.passScore,
      passed: score >= test.passScore,
      bestScore: Math.max(score, best ?? score),
      /* Merely viewing a past result adds nothing new. */
      pointsContributed: 0,
      coinsAwarded: 0,
      coinsAlreadyHeld: true,
      submittedAt: (submission.submittedAt ?? submission.updatedAt).toISOString(),
      questions: review,
    };
  }
}
