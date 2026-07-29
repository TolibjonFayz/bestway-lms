import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { LessonItemType, SubmissionStatus } from '@/common/enums';
import { fromLocal, localParts } from '@/common/tashkent';
import { Attendance, LessonItem, Submission, Unit, User } from '@/database/models';
import { effectiveScore } from '../dashboard/scoring';
import { MarksQueryDto } from './dto/marks-query.dto';
import { AttendanceDayDto, GradedItemDto, MarksChartPointDto, MarksDto } from './marks.types';

type GradedSubmission = Submission & {
  lessonItem?: LessonItem & { unit?: Unit };
  grader?: User;
};

@Injectable()
export class MarksService {
  constructor(
    @InjectModel(Submission) private readonly submissions: typeof Submission,
    @InjectModel(Attendance) private readonly attendance: typeof Attendance,
  ) {}

  async forStudent(studentId: number, query: MarksQueryDto): Promise<MarksDto> {
    const { year, month } = this.parseMonth(query.month);
    const monthStart = fromLocal(year, month, 1);
    const monthEnd = fromLocal(year, month + 1, 1);
    const previousStart = fromLocal(year, month - 1, 1);

    const [monthSubs, previousSubs, attendanceRows] = await Promise.all([
      this.loadGraded(studentId, monthStart, monthEnd),
      this.loadGraded(studentId, previousStart, monthStart),
      this.attendance.findAll({
        where: {
          studentId,
          date: { [Op.gte]: this.dateOnly(year, month, 1), [Op.lt]: this.dateOnly(year, month + 1, 1) },
        },
      }),
    ]);

    const average = this.average(monthSubs);
    const previousAverage = previousSubs.length ? this.average(previousSubs) : null;
    const trendPercent = previousAverage === null ? null : average - previousAverage;

    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;
    const pageRows = monthSubs.slice(offset, offset + limit);

    return {
      month: `${year}-${String(month + 1).padStart(2, '0')}`,
      average,
      previousAverage,
      trendPercent,
      chart: this.buildChart(monthSubs, year, month),
      attendance: this.buildAttendanceGrid(year, month, attendanceRows),
      items: {
        items: pageRows.map((row) => this.toGradedItem(row)),
        total: monthSubs.length,
        page,
        limit,
      },
    };
  }

  private parseMonth(raw?: string): { year: number; month: number } {
    if (raw) {
      const match = /^(\d{4})-(\d{2})$/.exec(raw);
      if (match) return { year: Number(match[1]), month: Number(match[2]) - 1 };
    }
    const now = localParts(new Date());
    return { year: now.year, month: now.month };
  }

  /** "YYYY-MM-DD" for a plain calendar day — matches Attendance.date, which is
      stored DATEONLY and carries no time zone of its own. Built with Date.UTC
      purely as calendar arithmetic (month/day overflow normalisation), never
      converted through a time-zone offset — doing that would shift the date
      by the +5 offset and land on the wrong day. */
  private dateOnly(year: number, month: number, day: number): string {
    const normalized = new Date(Date.UTC(year, month, day));
    const yyyy = normalized.getUTCFullYear();
    const mm = String(normalized.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(normalized.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private loadGraded(studentId: number, start: Date, end: Date): Promise<GradedSubmission[]> {
    return this.submissions.findAll({
      where: {
        studentId,
        status: { [Op.in]: [SubmissionStatus.Graded, SubmissionStatus.Returned] },
        submittedAt: { [Op.gte]: start, [Op.lt]: end },
      },
      include: [
        {
          model: LessonItem,
          as: 'lessonItem',
          include: [{ model: Unit, as: 'unit' }],
        },
        { model: User, as: 'grader', attributes: ['fullName'] },
      ],
      order: [['submittedAt', 'ASC']],
    }) as Promise<GradedSubmission[]>;
  }

  private average(subs: Submission[]): number {
    const scores = subs
      .map((sub) => effectiveScore(sub))
      .filter((value): value is number => value !== null);
    if (!scores.length) return 0;
    return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  }

  /* Weeks of the month in day-of-month chunks (1–7, 8–14, …). A bucket that
     has not started yet this month is left off entirely rather than shown
     empty; the bucket containing today is flagged isCurrent instead of
     carrying a literal "Joriy" label, so the client's locale file — not the
     API — owns that word. */
  private buildChart(subs: GradedSubmission[], year: number, month: number): MarksChartPointDto[] {
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const bucketCount = Math.ceil(daysInMonth / 7);
    const sums = new Array<number>(bucketCount).fill(0);
    const counts = new Array<number>(bucketCount).fill(0);

    for (const sub of subs) {
      if (!sub.submittedAt) continue;
      const score = effectiveScore(sub);
      if (score === null) continue;
      const day = localParts(sub.submittedAt).day;
      const bucket = Math.min(bucketCount - 1, Math.floor((day - 1) / 7));
      sums[bucket] += score;
      counts[bucket] += 1;
    }

    const now = localParts(new Date());
    const isCurrentMonth = now.year === year && now.month === month;
    const todayBucket = isCurrentMonth ? Math.floor((now.day - 1) / 7) : -1;

    const points: MarksChartPointDto[] = [];
    for (let index = 0; index < bucketCount; index += 1) {
      if (isCurrentMonth && index > todayBucket) break;
      points.push({
        weekIndex: index + 1,
        isCurrent: index === todayBucket,
        average: counts[index] ? Math.round(sums[index] / counts[index]) : 0,
      });
    }
    return points;
  }

  private buildAttendanceGrid(
    year: number,
    month: number,
    rows: Attendance[],
  ): AttendanceDayDto[] {
    const byDate = new Map(rows.map((row) => [row.date, row.status]));
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const out: AttendanceDayDto[] = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = this.dateOnly(year, month, day);
      out.push({ date: key, status: byDate.get(key) ?? null });
    }
    return out;
  }

  private toGradedItem(sub: GradedSubmission): GradedItemDto {
    return {
      id: sub.id,
      date: (sub.submittedAt ?? sub.createdAt).toISOString(),
      title: sub.lessonItem?.unit?.title ?? sub.lessonItem?.title ?? '',
      itemType: sub.lessonItem?.type === LessonItemType.Speaking ? 'speaking' : 'test',
      score: effectiveScore(sub) ?? 0,
      teacherComment: sub.teacherComment,
      graderName: sub.grader?.fullName ?? null,
    };
  }
}
