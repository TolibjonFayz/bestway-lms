import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { LessonItemType, QuestionType, SubmissionStatus } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Paginated } from '@/common/types';
import {
  LessonItem,
  Question,
  QuestionOption,
  SpeakingTask,
  Submission,
  Test,
  Unit,
  User,
} from '@/database/models';
import { effectiveScore } from '../dashboard/scoring';
import { TestsService } from '../tests/tests.service';
import { TeacherScopeService } from './teacher-scope.service';
import { TeacherSubmissionsQueryDto } from './dto/teacher-submissions-query.dto';
import {
  GradeSubmissionResultDto,
  SubmissionDetailDto,
  SubmissionItemType,
  SubmissionListItemDto,
  SubmissionListStatus,
  SubmissionQuestionReviewDto,
} from './teacher-submissions.types';

type QuestionWithOptions = Question & { options?: QuestionOption[] };
type LessonItemWithContext = LessonItem & {
  unit?: Unit;
  test?: Test & { questions?: QuestionWithOptions[] };
  speakingTask?: SpeakingTask;
};
type SubmissionWithContext = Submission & {
  student?: User;
  lessonItem?: LessonItemWithContext;
};

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

const UNANSWERED = '(javob berilmagan)';

@Injectable()
export class TeacherSubmissionsService {
  constructor(
    @InjectModel(Submission) private readonly submissions: typeof Submission,
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(LessonItem) private readonly lessonItems: typeof LessonItem,
    private readonly scope: TeacherScopeService,
    private readonly tests: TestsService,
  ) {}

  async list(
    teacherId: number,
    query: TeacherSubmissionsQueryDto,
  ): Promise<Paginated<SubmissionListItemDto>> {
    let studentIds = await this.scope.studentIdsFor(teacherId);

    if (query.groupId) {
      const groupIds = await this.scope.groupIdsFor(teacherId);
      if (!groupIds.includes(query.groupId)) {
        throw new ForbiddenException('Bu guruh sizga tegishli emas');
      }
      const rows = await this.users.findAll({
        where: { groupId: query.groupId, active: true },
        attributes: ['id'],
      });
      studentIds = rows.map((row) => row.id);
    }

    if (!studentIds.length) {
      return { items: [], total: 0, page: query.page, limit: query.limit };
    }

    const { rows, count } = await this.submissions.findAndCountAll({
      where: {
        studentId: { [Op.in]: studentIds },
        status: { [Op.in]: this.statusesFor(query.status) },
      },
      include: [
        { model: User, as: 'student', attributes: ['fullName'] },
        {
          model: LessonItem,
          as: 'lessonItem',
          include: [{ model: Unit, as: 'unit', attributes: ['title'] }],
        },
      ],
      order: [['submittedAt', 'ASC']],
      offset: (query.page - 1) * query.limit,
      limit: query.limit,
    });

    return {
      items: (rows as SubmissionWithContext[]).map((row) => this.toListItem(row)),
      total: count,
      page: query.page,
      limit: query.limit,
    };
  }

  async detail(teacherId: number, submissionId: number): Promise<SubmissionDetailDto> {
    const submission = await this.loadWithContext(submissionId);
    if (!submission) throw new NotFoundException('Topshiriq topilmadi');
    await this.assertOwned(teacherId, submission.studentId);
    return this.toDetail(submission);
  }

  async grade(
    teacherId: number,
    submissionId: number,
    score: number,
    comment: string | undefined,
  ): Promise<GradeSubmissionResultDto> {
    const submission = await this.submissions.findByPk(submissionId);
    if (!submission) throw new NotFoundException('Topshiriq topilmadi');
    await this.assertOwned(teacherId, submission.studentId);

    const wasPending = submission.status === SubmissionStatus.Submitted;
    await submission.update({
      manualScore: score,
      teacherComment: comment?.trim() || null,
      gradedBy: teacherId,
      gradedAt: new Date(),
      status: SubmissionStatus.Graded,
    });

    if (wasPending) {
      const item = await this.lessonItems.findByPk(submission.lessonItemId);
      if (item?.type === LessonItemType.Test) {
        await this.tests.finalizeManualGrade(
          submission.studentId,
          submission.lessonItemId,
          submission.id,
          score,
        );
      }
    }

    const [detail, nextPendingId] = await Promise.all([
      this.detail(teacherId, submissionId),
      this.nextPendingId(teacherId, submissionId),
    ]);

    return { submission: detail, nextPendingId };
  }

  private async assertOwned(teacherId: number, studentId: number): Promise<void> {
    if (!(await this.scope.ownsStudent(teacherId, studentId))) {
      throw new ForbiddenException('Bu topshiriq sizning guruhingizga tegishli emas');
    }
  }

  private statusesFor(status: 'pending' | 'graded' | 'all'): SubmissionStatus[] {
    if (status === 'pending') return [SubmissionStatus.Submitted];
    if (status === 'graded') return [SubmissionStatus.Graded, SubmissionStatus.Returned];
    return [SubmissionStatus.Submitted, SubmissionStatus.Graded, SubmissionStatus.Returned];
  }

  private async nextPendingId(teacherId: number, excludeId: number): Promise<number | null> {
    const studentIds = await this.scope.studentIdsFor(teacherId);
    if (!studentIds.length) return null;
    const next = await this.submissions.findOne({
      where: {
        studentId: { [Op.in]: studentIds },
        status: SubmissionStatus.Submitted,
        id: { [Op.ne]: excludeId },
      },
      order: [['submittedAt', 'ASC']],
      attributes: ['id'],
    });
    return next?.id ?? null;
  }

  private loadWithContext(id: number): Promise<SubmissionWithContext | null> {
    return this.submissions.findByPk(id, {
      include: [
        { model: User, as: 'student', attributes: ['fullName'] },
        {
          model: LessonItem,
          as: 'lessonItem',
          include: [
            { model: Unit, as: 'unit', attributes: ['title'] },
            {
              model: Test,
              as: 'test',
              include: [{ model: Question, as: 'questions', include: [{ model: QuestionOption, as: 'options' }] }],
            },
            { model: SpeakingTask, as: 'speakingTask' },
          ],
        },
      ],
    }) as Promise<SubmissionWithContext | null>;
  }

  private toListItem(row: SubmissionWithContext): SubmissionListItemDto {
    return {
      id: row.id,
      studentId: row.studentId,
      studentName: row.student?.fullName ?? '',
      initials: this.initials(row.student?.fullName ?? ''),
      unitTitle: row.lessonItem?.unit?.title ?? row.lessonItem?.title ?? '',
      itemType: this.itemTypeOf(row.lessonItem),
      status: this.listStatusOf(row.status),
      submittedAt: (row.submittedAt ?? row.createdAt).toISOString(),
      score: effectiveScore(row),
    };
  }

  private toDetail(submission: SubmissionWithContext): SubmissionDetailDto {
    const item = submission.lessonItem;
    const itemType = this.itemTypeOf(item);
    const answers = (submission.answers ?? {}) as Record<string, unknown>;

    let questions: SubmissionQuestionReviewDto[] | null = null;
    if (itemType === 'test' && item?.test?.questions) {
      const sorted = [...item.test.questions].sort((a, b) => a.orderIndex - b.orderIndex);
      questions = sorted.map((question) => this.describeQuestion(question, answers[String(question.id)]));
    }

    return {
      id: submission.id,
      studentId: submission.studentId,
      studentName: submission.student?.fullName ?? '',
      initials: this.initials(submission.student?.fullName ?? ''),
      unitTitle: item?.unit?.title ?? item?.title ?? '',
      itemType,
      status: this.listStatusOf(submission.status),
      submittedAt: (submission.submittedAt ?? submission.createdAt).toISOString(),
      score: effectiveScore(submission),
      autoScore: submission.autoScore,
      manualScore: submission.manualScore,
      teacherComment: submission.teacherComment,
      questions,
      speakingPrompt: itemType === 'speaking' ? (item?.speakingTask?.prompt ?? null) : null,
    };
  }

  private describeQuestion(
    question: QuestionWithOptions,
    rawAnswer: unknown,
  ): SubmissionQuestionReviewDto {
    const options = question.options ?? [];
    const base = {
      id: question.id,
      orderIndex: question.orderIndex,
      type: question.type,
      prompt: question.prompt,
    };

    if (question.type === QuestionType.Open) {
      const text = typeof rawAnswer === 'string' && rawAnswer.trim() ? rawAnswer : UNANSWERED;
      return { ...base, studentAnswerText: text, correctAnswerText: null, correct: null, autoGraded: false };
    }

    if (question.type === QuestionType.Matching) {
      const chosen =
        rawAnswer && typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)
          ? (rawAnswer as Record<string, unknown>)
          : {};
      const pairs = options.map((option) => {
        const picked = chosen[String(option.id)];
        return `${option.text} → ${typeof picked === 'string' && picked ? picked : '—'}`;
      });
      const rightCount = options.filter((option) => {
        const picked = chosen[String(option.id)];
        return typeof picked === 'string' && normalise(picked) === normalise(option.matchText ?? '');
      }).length;
      return {
        ...base,
        studentAnswerText: pairs.join('; '),
        correctAnswerText: options.map((o) => `${o.text} → ${o.matchText}`).join('; '),
        correct: options.length > 0 && rightCount === options.length,
        autoGraded: true,
      };
    }

    const correctOption = options.find((option) => option.isCorrect);
    const correctAnswerText = correctOption?.text ?? '';

    if (question.type === QuestionType.FillBlank) {
      const text = typeof rawAnswer === 'string' && rawAnswer.trim() ? rawAnswer : UNANSWERED;
      const correct =
        typeof rawAnswer === 'string' && normalise(rawAnswer) === normalise(correctAnswerText);
      return { ...base, studentAnswerText: text, correctAnswerText, correct, autoGraded: true };
    }

    const optionId =
      typeof rawAnswer === 'number' ? rawAnswer : typeof rawAnswer === 'string' ? Number(rawAnswer) : NaN;
    const chosenOption = options.find((option) => option.id === optionId);
    const correct = Number.isFinite(optionId) && correctOption?.id === optionId;
    return {
      ...base,
      studentAnswerText: chosenOption?.text ?? UNANSWERED,
      correctAnswerText,
      correct,
      autoGraded: true,
    };
  }

  private itemTypeOf(item?: LessonItem): SubmissionItemType {
    return item?.type === LessonItemType.Speaking ? 'speaking' : 'test';
  }

  private listStatusOf(status: SubmissionStatus): SubmissionListStatus {
    return status === SubmissionStatus.Submitted ? 'submitted' : 'graded';
  }

  private initials(fullName: string): string {
    return fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toLocaleUpperCase('uz'))
      .join('');
  }
}
