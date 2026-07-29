import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { LessonItemType, SubmissionStatus } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Paginated } from '@/common/types';
import {
  Course,
  Enrollment,
  LessonItem,
  Progress,
  Question,
  Submission,
  Test,
  Unit,
  User,
  VocabWord,
} from '@/database/models';
import {
  CourseSummaryDto,
  UnitDetailDto,
  UnitItemDetailDto,
  UnitItemSummaryDto,
  UnitSummaryDto,
} from './lessons.types';
import { resolveUnitStates, splitUnitTitle, unitPercent } from './unit-progress';

/** How many word pairs the collapsed vocabulary card previews. */
const VOCAB_PREVIEW_SIZE = 4;

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course) private readonly courses: typeof Course,
    @InjectModel(Unit) private readonly units: typeof Unit,
    @InjectModel(Enrollment) private readonly enrollments: typeof Enrollment,
    @InjectModel(Progress) private readonly progress: typeof Progress,
    @InjectModel(Submission) private readonly submissions: typeof Submission,
    @InjectModel(VocabWord) private readonly vocabWords: typeof VocabWord,
  ) {}

  async listForStudent(
    studentId: number,
    page: PaginationDto,
  ): Promise<Paginated<CourseSummaryDto>> {
    const enrolled = await this.enrollments.findAll({
      where: { studentId, active: true },
      attributes: ['courseId'],
    });
    const courseIds = enrolled.map((row) => row.courseId);
    if (!courseIds.length) {
      return { items: [], total: 0, page: page.page, limit: page.limit };
    }

    const { rows, count } = await this.courses.findAndCountAll({
      where: { id: { [Op.in]: courseIds }, active: true },
      include: [{ model: User, as: 'teacher', attributes: ['fullName'] }],
      order: [['id', 'ASC']],
      offset: page.offset,
      limit: page.limit,
    });

    const percentByItemId = await this.progressMap(studentId);
    const items = await Promise.all(
      rows.map((course) => this.summariseCourse(course, percentByItemId)),
    );
    return { items, total: count, page: page.page, limit: page.limit };
  }

  async listUnits(
    studentId: number,
    courseId: number,
    page: PaginationDto,
  ): Promise<Paginated<UnitSummaryDto>> {
    await this.assertEnrolled(studentId, courseId);

    /* Locking depends on the unit before it, so the whole course is loaded and
       resolved before the requested page is sliced out of it. */
    const units = await this.loadUnitsWithItems(courseId);
    const percentByItemId = await this.progressMap(studentId);
    const states = resolveUnitStates(units, percentByItemId);

    const all = units.map((unit) => {
      const state = states.get(unit.id)!;
      const { code, title } = splitUnitTitle(unit.title);
      return {
        id: unit.id,
        orderIndex: unit.orderIndex,
        code,
        title,
        percent: state.percent,
        status: state.status,
        locked: state.locked,
        items: (unit.items ?? []).map((item) =>
          this.summariseItem(item, percentByItemId, state.locked),
        ),
      };
    });

    return {
      items: all.slice(page.offset, page.offset + page.limit),
      total: all.length,
      page: page.page,
      limit: page.limit,
    };
  }

  async unitDetail(studentId: number, unitId: number): Promise<UnitDetailDto> {
    const unit = await this.units.findByPk(unitId, {
      include: [{ model: Course, as: 'course' }],
    });
    if (!unit?.course) throw new NotFoundException('Unit topilmadi');
    await this.assertEnrolled(studentId, unit.courseId);

    const siblings = await this.loadUnitsWithItems(unit.courseId);
    const percentByItemId = await this.progressMap(studentId);
    const state = resolveUnitStates(siblings, percentByItemId).get(unitId);
    if (!state) throw new NotFoundException('Unit topilmadi');

    /* A locked unit must not leak its contents — the client could otherwise
       render what it is not allowed to open. */
    if (state.locked) {
      throw new ForbiddenException('Oldingi unitni yakunlang');
    }

    const items = siblings.find((row) => row.id === unitId)?.items ?? [];
    const detail = await Promise.all(
      items.map((item) => this.detailItem(studentId, item, percentByItemId)),
    );
    const { code, title } = splitUnitTitle(unit.title);

    return {
      id: unit.id,
      courseId: unit.courseId,
      courseName: unit.course.name,
      subject: unit.course.subject,
      orderIndex: unit.orderIndex,
      code,
      title,
      percent: state.percent,
      status: state.status,
      locked: false,
      items: detail,
    };
  }

  private async assertEnrolled(studentId: number, courseId: number): Promise<void> {
    const enrolled = await this.enrollments.findOne({
      where: { studentId, courseId, active: true },
    });
    if (!enrolled) {
      throw new ForbiddenException('Siz bu kursga yozilmagansiz');
    }
  }

  private loadUnitsWithItems(courseId: number): Promise<(Unit & { items?: LessonItem[] })[]> {
    return this.units.findAll({
      where: { courseId },
      include: [{ model: LessonItem, as: 'items' }],
      order: [
        ['orderIndex', 'ASC'],
        [{ model: LessonItem, as: 'items' }, 'orderIndex', 'ASC'],
      ],
    }) as Promise<(Unit & { items?: LessonItem[] })[]>;
  }

  private async progressMap(studentId: number): Promise<Map<number, number>> {
    const rows = await this.progress.findAll({
      where: { studentId },
      attributes: ['lessonItemId', 'percent'],
    });
    return new Map(rows.map((row) => [row.lessonItemId, row.percent]));
  }

  private async summariseCourse(
    course: Course,
    percentByItemId: Map<number, number>,
  ): Promise<CourseSummaryDto> {
    const units = await this.loadUnitsWithItems(course.id);
    const percents = units.map((unit) =>
      unitPercent(unit.items ?? [], percentByItemId),
    );
    const percent = percents.length
      ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
      : 0;

    return {
      id: course.id,
      name: course.name,
      subject: course.subject,
      description: course.description,
      coverUrl: course.coverUrl,
      teacherName: course.teacher?.fullName ?? null,
      unitCount: units.length,
      completedUnits: percents.filter((value) => value === 100).length,
      percent,
    };
  }

  private summariseItem(
    item: LessonItem,
    percentByItemId: Map<number, number>,
    locked: boolean,
  ): UnitItemSummaryDto {
    return {
      id: item.id,
      type: item.type,
      title: item.title,
      /* A locked unit reports no progress — there cannot be any. */
      percent: locked ? 0 : (percentByItemId.get(item.id) ?? 0),
      meta: null,
    };
  }

  private async detailItem(
    studentId: number,
    item: LessonItem,
    percentByItemId: Map<number, number>,
  ): Promise<UnitItemDetailDto> {
    const percent = percentByItemId.get(item.id) ?? 0;
    const base: UnitItemDetailDto = {
      id: item.id,
      type: item.type,
      title: item.title,
      percent,
      meta: null,
    };

    /* Only the payload table matching this item's type is touched — a maths
       unit never asks for vocabulary or speaking. */
    if (item.type === LessonItemType.Video) {
      const video = await item.$get('video');
      if (video) {
        base.video = {
          url: video.url,
          durationSeconds: video.durationSeconds,
          thumbnailUrl: video.thumbnailUrl,
          watched: percent === 100,
          konspekt: video.konspekt ?? [],
        };
      }
      return base;
    }

    if (item.type === LessonItemType.Vocabulary) {
      const [wordCount, preview] = await Promise.all([
        this.vocabWords.count({ where: { lessonItemId: item.id } }),
        this.vocabWords.findAll({
          where: { lessonItemId: item.id },
          order: [['orderIndex', 'ASC']],
          limit: VOCAB_PREVIEW_SIZE,
        }),
      ]);
      base.vocabulary = {
        wordCount,
        preview: preview.map((word) => ({
          wordEn: word.wordEn,
          wordUz: word.wordUz,
        })),
      };
      base.meta = `${wordCount} ta soʻz`;
      return base;
    }

    if (item.type === LessonItemType.Test) {
      const test = await item.$get('test', {
        include: [{ model: Question, as: 'questions', attributes: ['id'] }],
      });
      const attempts = await this.submissions.findAll({
        where: {
          studentId,
          lessonItemId: item.id,
          status: {
            [Op.in]: [SubmissionStatus.Graded, SubmissionStatus.Returned],
          },
        },
      });
      const scores = attempts
        .map((row) => row.manualScore ?? row.autoScore)
        .filter((value): value is number => value !== null);

      const questionCount = test?.questions?.length ?? 0;
      base.test = {
        questionCount,
        passScore: test?.passScore ?? 60,
        attemptsAllowed: test?.attemptsAllowed ?? 1,
        score: scores.length ? Math.max(...scores) : null,
        attemptsUsed: attempts.length,
      };
      base.meta = `${questionCount} ta savol`;
      return base;
    }

    const speaking = await item.$get('speakingTask');
    if (speaking) {
      const submitted = await this.submissions.count({
        where: { studentId, lessonItemId: item.id },
      });
      base.speaking = {
        prompt: speaking.prompt,
        part: speaking.part,
        maxDurationSeconds: speaking.maxDurationSeconds,
        submitted: submitted > 0,
      };
    }
    return base;
  }
}
