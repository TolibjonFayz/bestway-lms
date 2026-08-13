import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { AttendanceStatus, SubmissionStatus } from '@/common/enums';
import { calendarDateKey, localParts } from '@/common/tashkent';
import { Attendance, Group, Submission, User } from '@/database/models';
import { ZoomService } from '../zoom/zoom.service';
import { TeacherScopeService } from './teacher-scope.service';
import {
  TeacherGroupDetailDto,
  TeacherGroupStudentDto,
  TeacherGroupSummaryDto,
} from './teacher-groups.types';

/* "Attended" counts both a clean arrival and a late one — a student who turned
   up ten minutes late was still in the lesson, and a register that treats that
   as an absence tells the teacher something untrue. */
const ATTENDED: AttendanceStatus[] = [AttendanceStatus.Present, AttendanceStatus.Late];

@Injectable()
export class TeacherGroupsService {
  constructor(
    @InjectModel(Group) private readonly groups: typeof Group,
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Attendance) private readonly attendance: typeof Attendance,
    @InjectModel(Submission) private readonly submissions: typeof Submission,
    private readonly scope: TeacherScopeService,
    private readonly zoom: ZoomService,
  ) {}

  /**
   * A link that drops the teacher straight into their group's meeting as
   * host, no separate Zoom login needed. Falls back to the plain join_url —
   * still joins the meeting, just without host controls — when the group's
   * link was pasted by hand rather than created through us, since only a
   * self-created meeting has a trustworthy id to mint a host token against.
   */
  async zoomStartUrl(teacherId: number, groupId: number): Promise<{ url: string; isHost: boolean }> {
    const group = await this.groups.findByPk(groupId);
    if (!group) throw new NotFoundException('Guruh topilmadi');
    if (!(await this.scope.ownsGroup(teacherId, groupId))) {
      throw new ForbiddenException('Bu guruh sizga tegishli emas');
    }
    if (!group.zoomJoinUrl) throw new NotFoundException('Zoom havolasi qoʻshilmagan');

    if (!group.zoomMeetingId) {
      return { url: group.zoomJoinUrl, isHost: false };
    }
    return { url: await this.zoom.getStartUrl(group.zoomMeetingId), isHost: true };
  }

  async listFor(teacherId: number): Promise<TeacherGroupSummaryDto[]> {
    const groups = await this.groups.findAll({
      where: { teacherId },
      order: [['name', 'ASC']],
    });
    if (!groups.length) return [];

    const groupIds = groups.map((group) => group.id);
    const students = await this.activeStudentsIn(groupIds);
    const attendance = await this.monthAttendance(groupIds);

    return groups.map((group) => {
      const members = students.filter((student) => student.groupId === group.id);
      return this.toSummary(
        group,
        members,
        attendance.filter((row) => row.groupId === group.id),
      );
    });
  }

  async detail(teacherId: number, groupId: number): Promise<TeacherGroupDetailDto> {
    const group = await this.groups.findByPk(groupId);
    if (!group) throw new NotFoundException('Guruh topilmadi');
    if (!(await this.scope.ownsGroup(teacherId, groupId))) {
      throw new ForbiddenException('Bu guruh sizga tegishli emas');
    }

    const students = await this.activeStudentsIn([groupId]);
    const studentIds = students.map((student) => student.id);

    const [attendance, graded] = await Promise.all([
      this.monthAttendance([groupId]),
      studentIds.length
        ? this.submissions.findAll({
            where: {
              studentId: { [Op.in]: studentIds },
              status: SubmissionStatus.Graded,
            },
            attributes: ['studentId', 'autoScore', 'manualScore'],
          })
        : Promise.resolve([]),
    ]);

    return {
      group: this.toSummary(group, students, attendance),
      students: students.map((student) =>
        this.toStudent(
          student,
          attendance.filter((row) => row.studentId === student.id),
          graded.filter((row) => row.studentId === student.id),
        ),
      ),
    };
  }

  private activeStudentsIn(groupIds: number[]): Promise<User[]> {
    return this.users.findAll({
      where: { groupId: { [Op.in]: groupIds }, active: true },
      attributes: ['id', 'fullName', 'level', 'groupId'],
      order: [['fullName', 'ASC']],
    });
  }

  /** Every attendance row for these groups in the current local month. */
  private monthAttendance(groupIds: number[]): Promise<Attendance[]> {
    const { year, month } = localParts(new Date());
    return this.attendance.findAll({
      where: {
        groupId: { [Op.in]: groupIds },
        date: {
          [Op.gte]: this.dateKey(year, month, 1),
          [Op.lt]: this.dateKey(year, month + 1, 1),
        },
      },
      attributes: ['studentId', 'groupId', 'status'],
    });
  }

  private toSummary(
    group: Group,
    members: User[],
    attendance: Attendance[],
  ): TeacherGroupSummaryDto {
    return {
      id: group.id,
      name: group.name,
      branch: group.branch,
      level: this.commonestLevel(members),
      studentCount: members.length,
      schedule: group.schedule ?? [],
      attendancePercent: this.attendancePercent(attendance),
    };
  }

  private toStudent(
    student: User,
    attendance: Attendance[],
    graded: Submission[],
  ): TeacherGroupStudentDto {
    const scores = graded.map((row) => row.manualScore ?? row.autoScore ?? 0);
    return {
      id: student.id,
      fullName: student.fullName,
      initials: this.initials(student.fullName),
      level: student.level ?? null,
      averageScore: scores.length
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : null,
      attendancePercent: this.attendancePercent(attendance),
    };
  }

  /** Null rather than 0 when nothing is marked — "no data" and "nobody came"
      are different answers and the UI shows them differently. */
  private attendancePercent(rows: Attendance[]): number | null {
    if (!rows.length) return null;
    const attended = rows.filter((row) => ATTENDED.includes(row.status)).length;
    return Math.round((attended / rows.length) * 100);
  }

  private commonestLevel(members: User[]): string | null {
    const counts = new Map<string, number>();
    for (const member of members) {
      if (!member.level) continue;
      counts.set(member.level, (counts.get(member.level) ?? 0) + 1);
    }
    let best: string | null = null;
    let bestCount = 0;
    for (const [level, count] of counts) {
      if (count > bestCount) {
        best = level;
        bestCount = count;
      }
    }
    return best;
  }

  private initials(fullName: string): string {
    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  private dateKey(year: number, month: number, day: number): string {
    return calendarDateKey(year, month, day);
  }
}
