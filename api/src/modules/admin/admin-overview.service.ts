import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { AttendanceStatus, SubmissionStatus, UserRole } from '@/common/enums';
import { calendarDateKey, fromLocal, localParts } from '@/common/tashkent';
import { Attendance, Group, LessonItem, Submission, Unit, User } from '@/database/models';
import {
  ActivityPointDto,
  AdminOverviewDto,
  AdminOverviewStatsDto,
  AttentionItemDto,
} from './admin-overview.types';

const ACTIVITY_WEEKS = 8;
/** A group below this share of attendance for the month is worth flagging. */
const LOW_ATTENDANCE_THRESHOLD = 70;
/** No submission in this many days counts as gone quiet. */
const INACTIVE_DAYS = 14;
const ATTENTION_LIMIT_PER_KIND = 5;

const ATTENDED: AttendanceStatus[] = [AttendanceStatus.Present, AttendanceStatus.Late];

const MONTH_SHORT = [
  'yan', 'fev', 'mar', 'apr', 'may', 'iyun',
  'iyul', 'avg', 'sen', 'okt', 'noy', 'dek',
];

@Injectable()
export class AdminOverviewService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Group) private readonly groups: typeof Group,
    @InjectModel(Unit) private readonly units: typeof Unit,
    @InjectModel(LessonItem) private readonly lessonItems: typeof LessonItem,
    @InjectModel(Submission) private readonly submissions: typeof Submission,
    @InjectModel(Attendance) private readonly attendance: typeof Attendance,
  ) {}

  async build(): Promise<AdminOverviewDto> {
    const now = new Date();
    const [stats, activity, attention] = await Promise.all([
      this.buildStats(now),
      this.buildActivity(now),
      this.buildAttention(now),
    ]);
    return { stats, activity, attention };
  }

  private async buildStats(now: Date): Promise<AdminOverviewStatsDto> {
    const { year, month } = localParts(now);
    const monthStart = calendarDateKey(year, month, 1);
    const nextMonth = calendarDateKey(year, month + 1, 1);

    const [studentCount, teacherCount, groups, ungradedCount, attendanceRows, gradedRows] =
      await Promise.all([
        this.users.count({ where: { role: UserRole.Student, active: true } }),
        this.users.count({ where: { role: UserRole.Teacher, active: true } }),
        this.groups.findAll({ attributes: ['id'] }),
        this.submissions.count({ where: { status: SubmissionStatus.Submitted } }),
        this.attendance.findAll({
          where: { date: { [Op.gte]: monthStart, [Op.lt]: nextMonth } },
          attributes: ['status'],
        }),
        this.submissions.findAll({
          where: {
            status: SubmissionStatus.Graded,
            submittedAt: { [Op.gte]: fromLocal(year, month, 1) },
          },
          attributes: ['autoScore', 'manualScore'],
        }),
      ]);

    const attended = attendanceRows.filter((row) => ATTENDED.includes(row.status)).length;
    const scores = gradedRows.map((row) => row.manualScore ?? row.autoScore ?? 0);

    return {
      studentCount,
      activeGroupCount: groups.length,
      teacherCount,
      avgAttendance: attendanceRows.length
        ? Math.round((attended / attendanceRows.length) * 100)
        : null,
      avgScore: scores.length
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : null,
      ungradedCount,
    };
  }

  /* Eight Monday-anchored buckets. Counting in JS rather than SQL keeps the
     week boundaries in Tashkent time; grouping in Postgres would bucket them
     by UTC and shift Sunday-evening work into the wrong week. */
  private async buildActivity(now: Date): Promise<ActivityPointDto[]> {
    const { year, month, day, weekday } = localParts(now);
    const daysSinceMonday = (weekday + 6) % 7;
    /* The last bucket is the current, still-running week, so the chart ends at
       today rather than at the close of the previous one. */
    const firstWeekStart = fromLocal(year, month, day - daysSinceMonday - 7 * (ACTIVITY_WEEKS - 1));

    const rows = await this.submissions.findAll({
      where: { submittedAt: { [Op.gte]: firstWeekStart } },
      attributes: ['submittedAt'],
    });

    return Array.from({ length: ACTIVITY_WEEKS }, (_, index) => {
      const start = fromLocal(
        year,
        month,
        day - daysSinceMonday - 7 * (ACTIVITY_WEEKS - 1 - index),
      );
      const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      const parts = localParts(start);
      return {
        weekStart: calendarDateKey(parts.year, parts.month, parts.day),
        label: `${parts.day}-${MONTH_SHORT[parts.month]}`,
        submissionCount: rows.filter((row) => {
          const at = row.submittedAt;
          return at !== null && at >= start && at < end;
        }).length,
      };
    });
  }

  private async buildAttention(now: Date): Promise<AttentionItemDto[]> {
    const [lowAttendance, inactive, emptyUnits] = await Promise.all([
      this.lowAttendanceGroups(now),
      this.inactiveStudents(now),
      this.unitsWithoutItems(),
    ]);
    return [...lowAttendance, ...inactive, ...emptyUnits];
  }

  private async lowAttendanceGroups(now: Date): Promise<AttentionItemDto[]> {
    const { year, month } = localParts(now);
    const rows = await this.attendance.findAll({
      where: {
        date: {
          [Op.gte]: calendarDateKey(year, month, 1),
          [Op.lt]: calendarDateKey(year, month + 1, 1),
        },
      },
      attributes: ['groupId', 'status'],
    });
    if (!rows.length) return [];

    const byGroup = new Map<number, { total: number; attended: number }>();
    for (const row of rows) {
      const bucket = byGroup.get(row.groupId) ?? { total: 0, attended: 0 };
      bucket.total += 1;
      if (ATTENDED.includes(row.status)) bucket.attended += 1;
      byGroup.set(row.groupId, bucket);
    }

    const flagged = [...byGroup.entries()]
      .map(([groupId, bucket]) => ({
        groupId,
        percent: Math.round((bucket.attended / bucket.total) * 100),
      }))
      .filter((entry) => entry.percent < LOW_ATTENDANCE_THRESHOLD)
      .sort((a, b) => a.percent - b.percent)
      .slice(0, ATTENTION_LIMIT_PER_KIND);
    if (!flagged.length) return [];

    const groups = await this.groups.findAll({
      where: { id: { [Op.in]: flagged.map((entry) => entry.groupId) } },
      attributes: ['id', 'name'],
    });
    const nameById = new Map(groups.map((group) => [group.id, group.name]));

    return flagged.map((entry) => ({
      kind: 'lowAttendance' as const,
      title: nameById.get(entry.groupId) ?? `#${entry.groupId}`,
      detail: `Bu oyda davomat ${entry.percent}%`,
      href: '/admin/students',
    }));
  }

  private async inactiveStudents(now: Date): Promise<AttentionItemDto[]> {
    const cutoff = new Date(now.getTime() - INACTIVE_DAYS * 24 * 60 * 60 * 1000);

    const [students, recent] = await Promise.all([
      this.users.findAll({
        where: { role: UserRole.Student, active: true },
        attributes: ['id', 'fullName'],
      }),
      this.submissions.findAll({
        where: { submittedAt: { [Op.gte]: cutoff } },
        attributes: ['studentId'],
      }),
    ]);

    const activeIds = new Set(recent.map((row) => row.studentId));
    return students
      .filter((student) => !activeIds.has(student.id))
      .slice(0, ATTENTION_LIMIT_PER_KIND)
      .map((student) => ({
        kind: 'inactiveStudent' as const,
        title: student.fullName,
        detail: `${INACTIVE_DAYS} kundan beri topshiriq yoʻq`,
        href: '/admin/students',
      }));
  }

  private async unitsWithoutItems(): Promise<AttentionItemDto[]> {
    const [units, items] = await Promise.all([
      this.units.findAll({ attributes: ['id', 'title', 'courseId'] }),
      this.lessonItems.findAll({ attributes: ['unitId'] }),
    ]);

    const filled = new Set(items.map((item) => item.unitId));
    return units
      .filter((unit) => !filled.has(unit.id))
      .slice(0, ATTENTION_LIMIT_PER_KIND)
      .map((unit) => ({
        kind: 'emptyUnit' as const,
        title: unit.title,
        detail: 'Unitda hali dars elementi yoʻq',
        href: '/admin/courses',
      }));
  }
}
