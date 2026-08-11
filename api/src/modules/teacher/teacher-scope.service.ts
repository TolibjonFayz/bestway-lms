import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Group, User } from '@/database/models';

/* The one place that answers "what belongs to this teacher" — a group they
   are assigned to teach, or a student in one of those groups. Every
   teacher-facing query must filter through here; a teacher who can bypass it
   could read or grade another teacher's students. */
@Injectable()
export class TeacherScopeService {
  constructor(
    @InjectModel(Group) private readonly groups: typeof Group,
    @InjectModel(User) private readonly users: typeof User,
  ) {}

  async groupIdsFor(teacherId: number): Promise<number[]> {
    const rows = await this.groups.findAll({
      where: { teacherId },
      attributes: ['id'],
    });
    return rows.map((row) => row.id);
  }

  /** True when this group is taught by this teacher — the guard every
      group-scoped endpoint calls before reading or writing its register. */
  async ownsGroup(teacherId: number, groupId: number): Promise<boolean> {
    const group = await this.groups.findByPk(groupId, { attributes: ['teacherId'] });
    return group?.teacherId === teacherId;
  }

  async studentIdsFor(teacherId: number): Promise<number[]> {
    const groupIds = await this.groupIdsFor(teacherId);
    if (!groupIds.length) return [];
    const rows = await this.users.findAll({
      where: { groupId: { [Op.in]: groupIds }, active: true },
      attributes: ['id'],
    });
    return rows.map((row) => row.id);
  }

  /** True when this student is taught by this teacher — the guard that makes
      cross-teacher access to a submission a 403, not just an unlisted item. */
  async ownsStudent(teacherId: number, studentId: number): Promise<boolean> {
    const student = await this.users.findByPk(studentId, { attributes: ['groupId'] });
    if (!student?.groupId) return false;
    const group = await this.groups.findByPk(student.groupId, { attributes: ['teacherId'] });
    return group?.teacherId === teacherId;
  }
}
