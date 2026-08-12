import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ExtraLessonStatus } from '@/common/enums';
import { ExtraLessonRequest, Group, Unit, User } from '@/database/models';
import { TeacherScopeService } from '../teacher/teacher-scope.service';
import {
  AnswerExtraLessonRequestDto,
  CreateExtraLessonRequestDto,
} from './dto/extra-lesson.dto';
import {
  ExtraLessonRequestDto,
  TeacherExtraLessonRequestDto,
} from './extra-lessons.types';

/** A student may not pile up more than this many unanswered requests. */
const OPEN_REQUEST_LIMIT = 3;

const OPEN_STATUSES = [ExtraLessonStatus.Sent, ExtraLessonStatus.UnderReview];

@Injectable()
export class ExtraLessonsService {
  constructor(
    @InjectModel(ExtraLessonRequest)
    private readonly requests: typeof ExtraLessonRequest,
    @InjectModel(Unit) private readonly units: typeof Unit,
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Group) private readonly groups: typeof Group,
    private readonly scope: TeacherScopeService,
  ) {}

  async listForStudent(studentId: number): Promise<ExtraLessonRequestDto[]> {
    const rows = await this.requests.findAll({
      where: { studentId },
      include: [{ model: Unit, as: 'unit' }],
      order: [['createdAt', 'DESC']],
    });
    return rows.map((row) => this.toDto(row));
  }

  async create(
    studentId: number,
    dto: CreateExtraLessonRequestDto,
  ): Promise<ExtraLessonRequestDto> {
    const open = await this.requests.count({
      where: { studentId, status: { [Op.in]: OPEN_STATUSES } },
    });
    if (open >= OPEN_REQUEST_LIMIT) {
      throw new BadRequestException(
        'Javob kutilayotgan soʻrovlaringiz koʻp — avval ularga javob kelishini kuting',
      );
    }

    if (dto.unitId) {
      const unit = await this.units.findByPk(dto.unitId);
      if (!unit) throw new BadRequestException('Unit topilmadi');
    }

    const created = await this.requests.create({
      studentId,
      unitId: dto.unitId ?? null,
      topic: dto.topic.trim(),
      preferredTime: dto.preferredTime?.trim() || null,
      status: ExtraLessonStatus.Sent,
      teacherNote: null,
      answeredBy: null,
      answeredAt: null,
    } as ExtraLessonRequest);

    return this.oneForStudent(studentId, created.id);
  }

  /** Requests from students in the teacher's own groups, open ones first. */
  async listForTeacher(teacherId: number): Promise<TeacherExtraLessonRequestDto[]> {
    const studentIds = await this.scope.studentIdsFor(teacherId);
    if (!studentIds.length) return [];

    const rows = await this.requests.findAll({
      where: { studentId: { [Op.in]: studentIds } },
      include: [{ model: Unit, as: 'unit' }],
      order: [['createdAt', 'DESC']],
    });
    if (!rows.length) return [];

    const students = await this.users.findAll({
      where: { id: { [Op.in]: [...new Set(rows.map((row) => row.studentId))] } },
      attributes: ['id', 'fullName', 'groupId'],
    });
    const studentById = new Map(students.map((student) => [student.id, student]));

    const groupIds = [
      ...new Set(students.map((student) => student.groupId).filter((id): id is number => id !== null)),
    ];
    const groups = groupIds.length
      ? await this.groups.findAll({ where: { id: { [Op.in]: groupIds } }, attributes: ['id', 'name'] })
      : [];
    const groupNameById = new Map(groups.map((group) => [group.id, group.name]));

    const enriched = rows.map((row) => {
      const student = studentById.get(row.studentId);
      const fullName = student?.fullName ?? '';
      return {
        ...this.toDto(row),
        studentId: row.studentId,
        studentName: fullName,
        studentInitials: fullName
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join(''),
        groupName: student?.groupId ? (groupNameById.get(student.groupId) ?? null) : null,
      };
    });

    /* Anything still awaiting an answer floats to the top; the rest keep their
       newest-first order underneath. */
    return [
      ...enriched.filter((row) => OPEN_STATUSES.includes(row.status)),
      ...enriched.filter((row) => !OPEN_STATUSES.includes(row.status)),
    ];
  }

  async answer(
    teacherId: number,
    requestId: number,
    dto: AnswerExtraLessonRequestDto,
  ): Promise<TeacherExtraLessonRequestDto> {
    const row = await this.requests.findByPk(requestId);
    if (!row) throw new NotFoundException('Soʻrov topilmadi');

    if (!(await this.scope.ownsStudent(teacherId, row.studentId))) {
      throw new ForbiddenException('Bu soʻrov sizning oʻquvchingizga tegishli emas');
    }

    await row.update({
      status: dto.status,
      teacherNote: dto.teacherNote?.trim() || null,
      answeredBy: teacherId,
      /* "Looking at it" is not an answer yet, so it leaves answeredAt unset. */
      answeredAt: dto.status === ExtraLessonStatus.UnderReview ? null : new Date(),
    });

    const all = await this.listForTeacher(teacherId);
    const updated = all.find((entry) => entry.id === requestId);
    if (!updated) throw new NotFoundException('Soʻrov topilmadi');
    return updated;
  }

  private async oneForStudent(
    studentId: number,
    requestId: number,
  ): Promise<ExtraLessonRequestDto> {
    const row = await this.requests.findOne({
      where: { id: requestId, studentId },
      include: [{ model: Unit, as: 'unit' }],
    });
    if (!row) throw new NotFoundException('Soʻrov topilmadi');
    return this.toDto(row);
  }

  private toDto(row: ExtraLessonRequest): ExtraLessonRequestDto {
    return {
      id: row.id,
      topic: row.topic,
      unitId: row.unitId,
      unitTitle: row.unit?.title ?? null,
      preferredTime: row.preferredTime,
      status: row.status,
      teacherNote: row.teacherNote,
      createdAt: row.createdAt.toISOString(),
      answeredAt: row.answeredAt?.toISOString() ?? null,
    };
  }
}
