import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { AttendanceStatus, LessonItemType, SubmissionStatus } from '@/common/enums';
import { fromLocal, localParts, parseWallClock } from '@/common/tashkent';
import { Attendance, Group, LessonItem, Submission, Unit, User } from '@/database/models';
import { TeacherScopeService } from './teacher-scope.service';
import {
  PendingSubmissionPreviewDto,
  ScheduleEntryDto,
  TeacherDashboardDto,
} from './teacher-dashboard.types';

/** 0 = Sunday, matching localParts().weekday. */
const WEEKDAY_NAMES = [
  'yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba',
];

const ATTENDANCE_WINDOW_DAYS = 30;
const PENDING_PREVIEW_SIZE = 4;

@Injectable()
export class TeacherDashboardService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Group) private readonly groups: typeof Group,
    @InjectModel(Submission) private readonly submissions: typeof Submission,
    @InjectModel(Attendance) private readonly attendance: typeof Attendance,
    private readonly scope: TeacherScopeService,
    private readonly sequelize: Sequelize,
  ) {}

  async forTeacher(teacherId: number): Promise<TeacherDashboardDto> {
    const teacher = await this.users.findByPk(teacherId);
    if (!teacher || !teacher.active) throw new NotFoundException('Foydalanuvchi topilmadi');

    const now = new Date();
    const [groupIds, studentIds] = await Promise.all([
      this.scope.groupIdsFor(teacherId),
      this.scope.studentIdsFor(teacherId),
    ]);

    const [schedule, pendingSubmissions, pendingCount, avgAttendance] = await Promise.all([
      this.buildSchedule(teacherId, now),
      this.pendingPreview(studentIds),
      studentIds.length
        ? this.submissions.count({
            where: { studentId: { [Op.in]: studentIds }, status: SubmissionStatus.Submitted },
          })
        : 0,
      this.averageAttendance(groupIds),
    ]);

    return {
      teacher: {
        firstName: teacher.fullName.split(' ')[0],
        fullName: teacher.fullName,
        initials: this.initials(teacher.fullName),
      },
      today: now.toISOString(),
      stats: {
        pendingCount,
        todayLessonsCount: schedule.length,
        studentCount: studentIds.length,
        avgAttendance,
      },
      schedule,
      pendingSubmissions,
    };
  }

  private async buildSchedule(teacherId: number, now: Date): Promise<ScheduleEntryDto[]> {
    const groups = await this.groups.findAll({ where: { teacherId } });
    const today = localParts(now);
    const todayName = WEEKDAY_NAMES[today.weekday];

    const entries: ScheduleEntryDto[] = [];
    for (const group of groups) {
      const courseName = await this.courseNameFor(group.id);
      for (const slot of group.schedule ?? []) {
        if (slot.day !== todayName) continue;
        const startMinutes = parseWallClock(slot.start);
        const endMinutes = parseWallClock(slot.end);
        if (startMinutes === null || endMinutes === null) continue;

        const startsAt = fromLocal(
          today.year, today.month, today.day,
          Math.floor(startMinutes / 60), startMinutes % 60,
        );
        const endsAt = fromLocal(
          today.year, today.month, today.day,
          Math.floor(endMinutes / 60), endMinutes % 60,
        );
        const status = now >= endsAt ? 'done' : now >= startsAt ? 'current' : 'upcoming';

        entries.push({
          groupId: group.id,
          groupName: group.name,
          courseName,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          status,
        });
      }
    }

    return entries.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  /* Groups carry no course of their own — a group's course is whichever
     course most of its students are actually enrolled in. Real data, not a
     fabricated label, at the cost of one small query per group. */
  private async courseNameFor(groupId: number): Promise<string | null> {
    const rows = await this.sequelize.query<{ name: string }>(
      `SELECT c.name, COUNT(*) AS cnt
         FROM enrollments e
         JOIN users u ON u.id = e.student_id AND u.group_id = :groupId
         JOIN courses c ON c.id = e.course_id
        WHERE e.active = TRUE
        GROUP BY c.id, c.name
        ORDER BY cnt DESC
        LIMIT 1`,
      { type: QueryTypes.SELECT, replacements: { groupId } },
    );
    return rows[0]?.name ?? null;
  }

  private async pendingPreview(studentIds: number[]): Promise<PendingSubmissionPreviewDto[]> {
    if (!studentIds.length) return [];
    const rows = await this.submissions.findAll({
      where: { studentId: { [Op.in]: studentIds }, status: SubmissionStatus.Submitted },
      include: [
        { model: User, as: 'student', attributes: ['fullName'] },
        {
          model: LessonItem,
          as: 'lessonItem',
          include: [{ model: Unit, as: 'unit', attributes: ['title'] }],
        },
      ],
      order: [['submittedAt', 'ASC']],
      limit: PENDING_PREVIEW_SIZE,
    });

    return rows.map((row) => ({
      id: row.id,
      studentId: row.studentId,
      studentName: row.student?.fullName ?? '',
      initials: this.initials(row.student?.fullName ?? ''),
      unitTitle: row.lessonItem?.unit?.title ?? row.lessonItem?.title ?? '',
      itemType: row.lessonItem?.type === LessonItemType.Speaking ? 'speaking' : 'test',
      submittedAt: (row.submittedAt ?? row.createdAt).toISOString(),
    }));
  }

  private async averageAttendance(groupIds: number[]): Promise<number> {
    if (!groupIds.length) return 0;
    const since = new Date(Date.now() - ATTENDANCE_WINDOW_DAYS * 86_400_000)
      .toISOString()
      .slice(0, 10);

    const rows = await this.attendance.findAll({
      where: { groupId: { [Op.in]: groupIds }, date: { [Op.gte]: since } },
      attributes: ['status'],
    });
    if (!rows.length) return 0;

    const present = rows.filter(
      (row) => row.status === AttendanceStatus.Present || row.status === AttendanceStatus.Late,
    ).length;
    return Math.round((present / rows.length) * 100);
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
