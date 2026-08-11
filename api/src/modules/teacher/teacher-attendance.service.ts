import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { AttendanceStatus } from '@/common/enums';
import {
  calendarDateKey,
  localDateKey,
  localParts,
  weekdayFromUzbekName,
} from '@/common/tashkent';
import { Attendance, Group, User } from '@/database/models';
import { TeacherScopeService } from './teacher-scope.service';
import {
  AttendanceRegisterDto,
  RegisterDayDto,
  RegisterStudentDto,
} from './teacher-attendance.types';
import {
  ClearAttendanceDto,
  MarkAttendanceDto,
  MarkDayDto,
} from './dto/attendance-register.dto';

/* A late arrival still counts as attended — see TeacherGroupsService. */
const ATTENDED: AttendanceStatus[] = [AttendanceStatus.Present, AttendanceStatus.Late];

@Injectable()
export class TeacherAttendanceService {
  constructor(
    @InjectModel(Group) private readonly groups: typeof Group,
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Attendance) private readonly attendance: typeof Attendance,
    private readonly scope: TeacherScopeService,
  ) {}

  async register(
    teacherId: number,
    groupId: number,
    month: string | undefined,
  ): Promise<AttendanceRegisterDto> {
    const group = await this.ownedGroup(teacherId, groupId);
    const { year, monthIndex } = this.parseMonth(month);

    const days = this.buildDays(group, year, monthIndex);
    const students = await this.users.findAll({
      where: { groupId, active: true },
      attributes: ['id', 'fullName'],
      order: [['fullName', 'ASC']],
    });

    const rows = await this.attendance.findAll({
      where: {
        groupId,
        date: {
          [Op.gte]: this.dateKey(year, monthIndex, 1),
          [Op.lt]: this.dateKey(year, monthIndex + 1, 1),
        },
      },
      attributes: ['studentId', 'date', 'status'],
    });

    return {
      group: { id: group.id, name: group.name, branch: group.branch },
      month: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
      days,
      students: students.map((student) =>
        this.toStudent(student, rows.filter((row) => row.studentId === student.id)),
      ),
    };
  }

  async markOne(teacherId: number, dto: MarkAttendanceDto): Promise<void> {
    const group = await this.ownedGroup(teacherId, dto.groupId);
    this.assertMarkable(group, dto.date);

    const student = await this.users.findByPk(dto.studentId, {
      attributes: ['id', 'groupId', 'active'],
    });
    if (!student?.active || student.groupId !== dto.groupId) {
      throw new ForbiddenException('Bu oʻquvchi guruhga tegishli emas');
    }

    await this.upsert(dto.groupId, dto.studentId, dto.date, dto.status);
  }

  /* Removing a mark is not the same as marking an absence — a day wrongly
     entered should be able to go back to having no answer at all. */
  async clearOne(teacherId: number, dto: ClearAttendanceDto): Promise<void> {
    await this.ownedGroup(teacherId, dto.groupId);
    await this.attendance.destroy({
      where: { groupId: dto.groupId, studentId: dto.studentId, date: dto.date },
    });
  }

  async markDay(teacherId: number, dto: MarkDayDto): Promise<void> {
    const group = await this.ownedGroup(teacherId, dto.groupId);
    this.assertMarkable(group, dto.date);

    const students = await this.users.findAll({
      where: { groupId: dto.groupId, active: true },
      attributes: ['id'],
    });

    /* Sequential rather than parallel: the same (student, date) pair can only
       have one row, and concurrent upserts on it race each other. */
    for (const student of students) {
      await this.upsert(dto.groupId, student.id, dto.date, dto.status);
    }
  }

  /** One row per (student, date) — re-marking updates rather than duplicating. */
  private async upsert(
    groupId: number,
    studentId: number,
    date: string,
    status: AttendanceStatus,
  ): Promise<void> {
    const existing = await this.attendance.findOne({ where: { studentId, date } });
    if (existing) {
      await existing.update({ status, groupId });
      return;
    }
    await this.attendance.create({ studentId, groupId, date, status } as Attendance);
  }

  private async ownedGroup(teacherId: number, groupId: number): Promise<Group> {
    const group = await this.groups.findByPk(groupId);
    if (!group) throw new NotFoundException('Guruh topilmadi');
    if (!(await this.scope.ownsGroup(teacherId, groupId))) {
      throw new ForbiddenException('Bu guruh sizga tegishli emas');
    }
    return group;
  }

  /* Refusing a day the timetable does not cover keeps the register honest —
     the UI already hides those cells, and a client is not the place to enforce
     it. A future date is refused for the same reason. */
  private assertMarkable(group: Group, date: string): void {
    const lessonWeekdays = this.lessonWeekdays(group);
    const parsed = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Sana notoʻgʻri');
    }
    if (!lessonWeekdays.has(parsed.getUTCDay())) {
      throw new BadRequestException('Bu kunda guruhning darsi yoʻq');
    }
    if (date > localDateKey(new Date())) {
      throw new BadRequestException('Kelajakdagi kunga davomat qoʻyib boʻlmaydi');
    }
  }

  private lessonWeekdays(group: Group): Set<number> {
    const weekdays = new Set<number>();
    for (const slot of group.schedule ?? []) {
      const weekday = weekdayFromUzbekName(slot.day);
      if (weekday !== null) weekdays.add(weekday);
    }
    return weekdays;
  }

  private buildDays(group: Group, year: number, monthIndex: number): RegisterDayDto[] {
    const lessonWeekdays = this.lessonWeekdays(group);
    const todayKey = localDateKey(new Date());
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const dayOfMonth = index + 1;
      const date = this.dateKey(year, monthIndex, dayOfMonth);
      const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
      return {
        date,
        dayOfMonth,
        weekday,
        hasLesson: lessonWeekdays.has(weekday),
        isFuture: date > todayKey,
      };
    });
  }

  private toStudent(student: User, rows: Attendance[]): RegisterStudentDto {
    const marks: Record<string, AttendanceStatus> = {};
    for (const row of rows) marks[row.date] = row.status;

    const attended = rows.filter((row) => ATTENDED.includes(row.status)).length;
    return {
      id: student.id,
      fullName: student.fullName,
      initials: student.fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join(''),
      marks,
      attendancePercent: rows.length ? Math.round((attended / rows.length) * 100) : null,
    };
  }

  private parseMonth(month: string | undefined): { year: number; monthIndex: number } {
    if (!month) {
      const parts = localParts(new Date());
      return { year: parts.year, monthIndex: parts.month };
    }
    const [year, monthNumber] = month.split('-').map(Number);
    return { year, monthIndex: monthNumber - 1 };
  }

  private dateKey(year: number, monthIndex: number, day: number): string {
    return calendarDateKey(year, monthIndex, day);
  }
}
