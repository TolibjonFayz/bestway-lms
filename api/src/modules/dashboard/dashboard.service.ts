import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SubmissionStatus } from '@/common/enums';
import { localDateKey, localWeekKeys } from '@/common/tashkent';
import {
  Announcement,
  Course,
  Group,
  LessonItem,
  Progress,
  Submission,
  Unit,
  User,
} from '@/database/models';
import { UsersService } from '../users/users.service';
import { JOIN_GRACE_MINUTES, nextSlot } from './next-lesson';
import { CoinsService } from '../gamification/coins.service';
import { totalPoints } from './scoring';
import {
  AnnouncementDto,
  CurrentUnitDto,
  DashboardDto,
  WeeklyDayDto,
} from './dashboard.types';

/** Uzbek column heads for the weekly strip, Monday first. */
const WEEKDAY_LABELS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

/** How long an announcement keeps its unread ring. */
const ANNOUNCEMENT_FRESH_DAYS = 7;

type ProgressWithItem = Progress & { lessonItem?: LessonItem };

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Progress) private readonly progress: typeof Progress,
    @InjectModel(Submission) private readonly submissions: typeof Submission,
    @InjectModel(Announcement) private readonly announcements: typeof Announcement,
    @InjectModel(Unit) private readonly units: typeof Unit,
    @InjectModel(Group) private readonly groups: typeof Group,
    private readonly users: UsersService,
    private readonly coins: CoinsService,
    private readonly sequelize: Sequelize,
  ) {}

  async forStudent(studentId: number): Promise<DashboardDto> {
    const now = new Date();
    const student = await this.users.getActiveById(studentId);

    /* Every read below is scoped to this student, so they run together. */
    const [progressRows, gradedSubmissions, announcements, group] =
      await Promise.all([
        this.loadProgress(studentId),
        this.loadGradedSubmissions(studentId),
        this.loadAnnouncements(now),
        student.groupId ? this.groups.findByPk(student.groupId, {
          include: [{ model: User, as: 'teacher', attributes: ['fullName'] }],
        }) : null,
      ]);

    const currentUnit = await this.resolveCurrentUnit(studentId, progressRows);
    const points = totalPoints(gradedSubmissions);
    const coins = await this.coins.totalFor(studentId);
    const rank = await this.resolveRank(studentId, points);

    return {
      student: {
        id: student.id,
        firstName: student.fullName.split(' ')[0],
        fullName: student.fullName,
        level: student.level,
        initials: this.initials(student.fullName),
      },
      today: now.toISOString(),
      /* No progress at all is the brand-new student the empty state is for. */
      isNew: progressRows.length === 0,
      nextLesson: this.buildNextLesson(group, currentUnit, now),
      stats: {
        coins,
        points,
        rank: rank.position,
        rankedOutOf: rank.outOf,
        homework: currentUnit
          ? { unitTitle: currentUnit.title, percent: currentUnit.percent }
          : null,
      },
      currentUnit,
      weekly: this.buildWeekly(progressRows, gradedSubmissions, now),
      announcements,
    };
  }

  private loadProgress(studentId: number): Promise<ProgressWithItem[]> {
    return this.progress.findAll({
      where: { studentId },
      include: [
        {
          model: LessonItem,
          as: 'lessonItem',
          include: [
            {
              model: Unit,
              as: 'unit',
              include: [{ model: Course, as: 'course' }],
            },
          ],
        },
      ],
      order: [['updatedAt', 'DESC']],
    }) as Promise<ProgressWithItem[]>;
  }

  private loadGradedSubmissions(studentId: number): Promise<Submission[]> {
    return this.submissions.findAll({
      where: {
        studentId,
        status: { [Op.in]: [SubmissionStatus.Graded, SubmissionStatus.Returned] },
      },
    });
  }

  private async loadAnnouncements(now: Date): Promise<AnnouncementDto[]> {
    const rows = await this.announcements.findAll({
      where: { active: true },
      order: [
        ['orderIndex', 'ASC'],
        ['publishedAt', 'DESC'],
      ],
      limit: 10,
    });

    const freshAfter = now.getTime() - ANNOUNCEMENT_FRESH_DAYS * 86_400_000;
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      icon: row.icon,
      tone: row.tone,
      unread: row.publishedAt.getTime() >= freshAfter,
    }));
  }

  /* The course the student is actually working through is the one their most
     recent progress row belongs to — groups carry no course reference. */
  private async resolveCurrentUnit(
    studentId: number,
    progressRows: ProgressWithItem[],
  ): Promise<CurrentUnitDto | null> {
    const latest = progressRows.find((row) => row.lessonItem?.unit?.course);
    const course = latest?.lessonItem?.unit?.course;
    if (!course) return null;

    const percentByItemId = new Map(
      progressRows.map((row) => [row.lessonItemId, row.percent]),
    );

    const units = await this.units.findAll({
      where: { courseId: course.id },
      include: [{ model: LessonItem, as: 'items' }],
      order: [
        ['orderIndex', 'ASC'],
        [{ model: LessonItem, as: 'items' }, 'orderIndex', 'ASC'],
      ],
    });

    /* The first unit that is not finished; if every unit is done, show the
       last one rather than nothing. */
    const unfinished = units.find((unit) =>
      (unit.items ?? []).some((item) => (percentByItemId.get(item.id) ?? 0) < 100),
    );
    const unit = unfinished ?? units[units.length - 1];
    if (!unit) return null;

    const items = (unit.items ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      percent: percentByItemId.get(item.id) ?? 0,
    }));
    const percent = items.length
      ? Math.round(items.reduce((sum, item) => sum + item.percent, 0) / items.length)
      : 0;

    return {
      unitId: unit.id,
      title: unit.title,
      courseName: course.name,
      subject: course.subject,
      level: null,
      percent,
      items,
    };
  }

  /* Centre-wide leaderboard by total graded marks. Students with no scored
     work are unranked rather than shown sharing last place. */
  private async resolveRank(
    studentId: number,
    points: number,
  ): Promise<{ position: number | null; outOf: number }> {
    /* Same "highest score per item" rule as totalPoints(): the inner query
       collapses retakes to their best mark before the outer sum ever sees
       them, so resubmitting a test cannot inflate a student's rank. */
    const rows = await this.sequelize.query<{ student_id: number; pts: string }>(
      `SELECT student_id, SUM(best_score) AS pts
         FROM (
           SELECT s.student_id, s.lesson_item_id,
                  MAX(COALESCE(s.manual_score, s.auto_score)) AS best_score
             FROM submissions s
             JOIN users u ON u.id = s.student_id AND u.active = TRUE AND u.role = 'student'
            WHERE s.status IN ('graded', 'returned')
            GROUP BY s.student_id, s.lesson_item_id
         ) best
        GROUP BY student_id
       HAVING SUM(best_score) > 0
        ORDER BY pts DESC`,
      { type: QueryTypes.SELECT },
    );

    if (points <= 0) return { position: null, outOf: rows.length };
    const index = rows.findIndex((row) => Number(row.student_id) === studentId);
    return {
      position: index === -1 ? null : index + 1,
      outOf: rows.length,
    };
  }

  private buildNextLesson(
    group: Group | null,
    currentUnit: CurrentUnitDto | null,
    now: Date,
  ): DashboardDto['nextLesson'] {
    if (!group) return null;
    const slot = nextSlot(group.schedule ?? [], now);
    if (!slot) return null;

    const courseName = currentUnit?.courseName ?? null;
    const unitTitle = currentUnit?.title ?? null;
    /* "IELTS — Unit 5.2": the course, then the unit's own numbering. */
    const shortUnit = unitTitle?.split('—')[0]?.trim() ?? null;

    return {
      title: [courseName, shortUnit].filter(Boolean).join(' — ') || group.name,
      courseName: courseName ?? group.name,
      unitTitle,
      teacherName: group.teacher?.fullName ?? null,
      startsAt: slot.startsAt.toISOString(),
      endsAt: slot.endsAt.toISOString(),
      joinOpensAt: slot.joinOpensAt.toISOString(),
      joinClosesAt: slot.endsAt.toISOString(),
      zoomJoinUrl: group.zoomJoinUrl ?? null,
    };
  }

  /* A day counts as active when the student touched any lesson item or handed
     work in on it, in Tashkent local time. */
  private buildWeekly(
    progressRows: ProgressWithItem[],
    submissions: Submission[],
    now: Date,
  ): DashboardDto['weekly'] {
    const touched = new Set<string>();
    for (const row of progressRows) {
      touched.add(localDateKey(row.completedAt ?? row.updatedAt));
    }
    for (const submission of submissions) {
      if (submission.submittedAt) {
        touched.add(localDateKey(submission.submittedAt));
      }
    }

    const todayKey = localDateKey(now);
    const days: WeeklyDayDto[] = localWeekKeys(now).map((date, index) => ({
      date,
      label: WEEKDAY_LABELS[index],
      active: touched.has(date),
      isToday: date === todayKey,
      isFuture: date > todayKey,
    }));

    return { days, activeDays: days.filter((day) => day.active).length };
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

export { JOIN_GRACE_MINUTES };
