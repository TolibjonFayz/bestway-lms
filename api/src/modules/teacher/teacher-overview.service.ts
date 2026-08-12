import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import {
  AttendanceStatus,
  LessonItemType,
  SubmissionStatus,
  UserRole,
} from '@/common/enums';
import { calendarDateKey, localParts } from '@/common/tashkent';
import { Paginated } from '@/common/types';
import {
  Attendance,
  Course,
  Group,
  LessonItem,
  Submission,
  Unit,
  User,
} from '@/database/models';
import { TeacherScopeService } from './teacher-scope.service';
import {
  TeacherStudentRowDto,
  TeacherTaskRowDto,
} from './teacher-overview.types';
import {
  TeacherStudentsQueryDto,
  TeacherTasksQueryDto,
} from './dto/teacher-overview.dto';

/** Item types a student actually submits — the ones worth tracking here. */
const ASSESSED_TYPES = [LessonItemType.Test, LessonItemType.Speaking];

const ATTENDED: AttendanceStatus[] = [AttendanceStatus.Present, AttendanceStatus.Late];

@Injectable()
export class TeacherOverviewService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Group) private readonly groups: typeof Group,
    @InjectModel(Unit) private readonly units: typeof Unit,
    @InjectModel(Course) private readonly courses: typeof Course,
    @InjectModel(LessonItem) private readonly lessonItems: typeof LessonItem,
    @InjectModel(Submission) private readonly submissions: typeof Submission,
    @InjectModel(Attendance) private readonly attendance: typeof Attendance,
    private readonly scope: TeacherScopeService,
  ) {}

  async tasks(
    teacherId: number,
    query: TeacherTasksQueryDto,
  ): Promise<TeacherTaskRowDto[]> {
    const studentIds = await this.studentIdsInScope(teacherId, query.groupId);
    if (!studentIds.length) return [];

    /* Only items these students have actually engaged with appear — listing
       every test in the catalogue would bury the ones needing attention. */
    const submissions = await this.submissions.findAll({
      where: {
        studentId: { [Op.in]: studentIds },
        status: { [Op.in]: [SubmissionStatus.Submitted, SubmissionStatus.Graded] },
      },
      attributes: ['studentId', 'lessonItemId', 'status', 'autoScore', 'manualScore'],
    });
    if (!submissions.length) return [];

    const itemIds = [...new Set(submissions.map((row) => row.lessonItemId))];
    const items = await this.lessonItems.findAll({
      where: { id: { [Op.in]: itemIds }, type: { [Op.in]: ASSESSED_TYPES } },
    });
    if (!items.length) return [];

    const units = await this.units.findAll({
      where: { id: { [Op.in]: [...new Set(items.map((item) => item.unitId))] } },
    });
    const unitById = new Map(units.map((unit) => [unit.id, unit]));

    const courses = await this.courses.findAll({
      where: { id: { [Op.in]: [...new Set(units.map((unit) => unit.courseId))] } },
      attributes: ['id', 'name'],
    });
    const courseNameById = new Map(courses.map((course) => [course.id, course.name]));

    const rows = items.map((item) => {
      const own = submissions.filter((row) => row.lessonItemId === item.id);
      const graded = own.filter((row) => row.status === SubmissionStatus.Graded);
      const scores = graded.map((row) => row.manualScore ?? row.autoScore ?? 0);
      const unit = unitById.get(item.unitId);

      return {
        lessonItemId: item.id,
        title: item.title,
        type: item.type,
        unitTitle: unit?.title ?? '',
        courseName: unit ? (courseNameById.get(unit.courseId) ?? '') : '',
        submittedCount: own.length,
        pendingCount: own.length - graded.length,
        gradedCount: graded.length,
        notStartedCount: Math.max(0, studentIds.length - own.length),
        averageScore: scores.length
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          : null,
      };
    });

    /* Anything still waiting on the teacher floats to the top. */
    return rows.sort((a, b) => b.pendingCount - a.pendingCount || b.submittedCount - a.submittedCount);
  }

  async students(
    teacherId: number,
    query: TeacherStudentsQueryDto,
  ): Promise<Paginated<TeacherStudentRowDto>> {
    const groupIds = await this.groupIdsInScope(teacherId, query.groupId);
    if (!groupIds.length) {
      return { items: [], total: 0, page: query.page, limit: query.limit };
    }

    const where: WhereOptions<User> = {
      role: UserRole.Student,
      active: true,
      groupId: { [Op.in]: groupIds },
    };
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      (where as Record<symbol, unknown>)[Op.or] = [
        { fullName: { [Op.iLike]: term } },
        { phone: { [Op.iLike]: term } },
      ];
    }

    const { rows, count } = await this.users.findAndCountAll({
      where,
      attributes: ['id', 'fullName', 'phone', 'level', 'groupId'],
      order: [['fullName', 'ASC']],
      offset: (query.page - 1) * query.limit,
      limit: query.limit,
    });
    if (!rows.length) {
      return { items: [], total: count, page: query.page, limit: query.limit };
    }

    const ids = rows.map((row) => row.id);
    const [groups, submissions, attendance] = await Promise.all([
      this.groups.findAll({ where: { id: { [Op.in]: groupIds } }, attributes: ['id', 'name'] }),
      this.submissions.findAll({
        where: {
          studentId: { [Op.in]: ids },
          status: { [Op.in]: [SubmissionStatus.Submitted, SubmissionStatus.Graded] },
        },
        attributes: ['studentId', 'status', 'autoScore', 'manualScore', 'submittedAt'],
      }),
      this.monthAttendance(ids),
    ]);

    const groupNameById = new Map(groups.map((group) => [group.id, group.name]));

    return {
      items: rows.map((student) => {
        const own = submissions.filter((row) => row.studentId === student.id);
        const graded = own.filter((row) => row.status === SubmissionStatus.Graded);
        const scores = graded.map((row) => row.manualScore ?? row.autoScore ?? 0);
        const marks = attendance.filter((row) => row.studentId === student.id);
        const attended = marks.filter((row) => ATTENDED.includes(row.status)).length;

        const latest = own
          .map((row) => row.submittedAt)
          .filter((at): at is Date => at !== null)
          .sort((a, b) => b.getTime() - a.getTime())[0];

        return {
          id: student.id,
          fullName: student.fullName,
          initials: student.fullName
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join(''),
          phone: student.phone,
          groupId: student.groupId,
          groupName: student.groupId ? (groupNameById.get(student.groupId) ?? null) : null,
          level: student.level,
          averageScore: scores.length
            ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
            : null,
          attendancePercent: marks.length
            ? Math.round((attended / marks.length) * 100)
            : null,
          lastActivityAt: latest?.toISOString() ?? null,
          pendingCount: own.length - graded.length,
        };
      }),
      total: count,
      page: query.page,
      limit: query.limit,
    };
  }

  /** The teacher's groups, narrowed to one when asked — and refused outright
      if that one is not theirs. */
  private async groupIdsInScope(
    teacherId: number,
    groupId: number | undefined,
  ): Promise<number[]> {
    const own = await this.scope.groupIdsFor(teacherId);
    if (groupId === undefined) return own;
    if (!own.includes(groupId)) {
      throw new ForbiddenException('Bu guruh sizga tegishli emas');
    }
    return [groupId];
  }

  private async studentIdsInScope(
    teacherId: number,
    groupId: number | undefined,
  ): Promise<number[]> {
    const groupIds = await this.groupIdsInScope(teacherId, groupId);
    if (!groupIds.length) return [];
    const rows = await this.users.findAll({
      where: { role: UserRole.Student, active: true, groupId: { [Op.in]: groupIds } },
      attributes: ['id'],
    });
    return rows.map((row) => row.id);
  }

  private monthAttendance(studentIds: number[]): Promise<Attendance[]> {
    const { year, month } = localParts(new Date());
    return this.attendance.findAll({
      where: {
        studentId: { [Op.in]: studentIds },
        date: {
          [Op.gte]: calendarDateKey(year, month, 1),
          [Op.lt]: calendarDateKey(year, month + 1, 1),
        },
      },
      attributes: ['studentId', 'status'],
    });
  }
}
