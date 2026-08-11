import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { UserRole } from '@/common/enums';
import { Paginated } from '@/common/types';
import { Group, User } from '@/database/models';
import { UsersService } from '../users/users.service';
import { AdminTeacherDto } from './admin-people.types';
import {
  AdminTeachersQueryDto,
  CreateTeacherDto,
  UpdateTeacherDto,
  UpdateTeacherStatusDto,
} from './dto/teacher.dto';

@Injectable()
export class AdminTeachersService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Group) private readonly groups: typeof Group,
    private readonly usersService: UsersService,
  ) {}

  async list(query: AdminTeachersQueryDto): Promise<Paginated<AdminTeacherDto>> {
    const where: WhereOptions<User> = { role: UserRole.Teacher };
    if (query.status === 'active') where.active = true;
    else if (query.status === 'inactive') where.active = false;
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      (where as Record<symbol, unknown>)[Op.or] = [
        { fullName: { [Op.iLike]: term } },
        { phone: { [Op.iLike]: term } },
      ];
    }

    const { rows, count } = await this.users.findAndCountAll({
      where,
      order: [['fullName', 'ASC']],
      offset: (query.page - 1) * query.limit,
      limit: query.limit,
    });

    const items = await this.withGroups(rows);
    return { items, total: count, page: query.page, limit: query.limit };
  }

  async create(dto: CreateTeacherDto): Promise<AdminTeacherDto> {
    if (await this.usersService.findByPhone(dto.phone)) {
      throw new BadRequestException('Bu telefon raqami allaqachon roʻyxatdan oʻtgan');
    }

    const teacher = await this.users.create({
      phone: dto.phone,
      passwordHash: await this.usersService.hashPassword(dto.password),
      role: UserRole.Teacher,
      fullName: dto.fullName.trim(),
      avatarUrl: null,
      level: null,
      groupId: null,
      active: true,
    } as User);

    if (dto.groupIds?.length) await this.assignGroups(teacher.id, dto.groupIds);

    return this.one(teacher.id);
  }

  async update(id: number, dto: UpdateTeacherDto): Promise<AdminTeacherDto> {
    const teacher = await this.teacherOrThrow(id);

    if (dto.phone && dto.phone !== teacher.phone) {
      const clash = await this.usersService.findByPhone(dto.phone);
      if (clash) throw new BadRequestException('Bu telefon raqami allaqachon roʻyxatdan oʻtgan');
    }

    const changes: Partial<User> = {};
    if (dto.fullName) changes.fullName = dto.fullName.trim();
    if (dto.phone) changes.phone = dto.phone;
    if (dto.password) changes.passwordHash = await this.usersService.hashPassword(dto.password);
    if (Object.keys(changes).length) await teacher.update(changes);

    if (dto.groupIds) await this.assignGroups(id, dto.groupIds);

    return this.one(id);
  }

  async setStatus(id: number, dto: UpdateTeacherStatusDto): Promise<AdminTeacherDto> {
    const teacher = await this.teacherOrThrow(id);

    /* Deactivating releases their groups so nobody is left with a teacher who
       can no longer log in; the groups' submissions and attendance are keyed
       to the group, not the teacher, so nothing is lost. */
    if (!dto.active) await this.groups.update({ teacherId: null }, { where: { teacherId: id } });

    await teacher.update({ active: dto.active });
    return this.one(id);
  }

  async one(id: number): Promise<AdminTeacherDto> {
    const teacher = await this.teacherOrThrow(id);
    const [dto] = await this.withGroups([teacher]);
    return dto;
  }

  /** Makes this teacher own exactly these groups — anything dropped from the
      list goes back to having no teacher rather than keeping a stale owner. */
  private async assignGroups(teacherId: number, groupIds: number[]): Promise<void> {
    const unique = [...new Set(groupIds)];
    if (unique.length) {
      const found = await this.groups.count({ where: { id: { [Op.in]: unique } } });
      if (found !== unique.length) throw new BadRequestException('Guruh topilmadi');
    }

    await this.groups.update({ teacherId: null }, { where: { teacherId } });
    if (unique.length) {
      await this.groups.update({ teacherId }, { where: { id: { [Op.in]: unique } } });
    }
  }

  private async withGroups(teachers: User[]): Promise<AdminTeacherDto[]> {
    if (!teachers.length) return [];
    const ids = teachers.map((teacher) => teacher.id);

    const groups = await this.groups.findAll({
      where: { teacherId: { [Op.in]: ids } },
      attributes: ['id', 'name', 'branch', 'teacherId'],
      order: [['name', 'ASC']],
    });

    const groupIds = groups.map((group) => group.id);
    const students = groupIds.length
      ? await this.users.findAll({
          where: {
            role: UserRole.Student,
            active: true,
            groupId: { [Op.in]: groupIds },
          },
          attributes: ['groupId'],
        })
      : [];

    return teachers.map((teacher) => {
      const own = groups.filter((group) => group.teacherId === teacher.id);
      const ownIds = new Set(own.map((group) => group.id));
      return {
        id: teacher.id,
        fullName: teacher.fullName,
        initials: teacher.fullName
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join(''),
        phone: teacher.phone,
        groups: own.map((group) => ({
          id: group.id,
          name: group.name,
          branch: group.branch,
        })),
        studentCount: students.filter(
          (student) => student.groupId !== null && ownIds.has(student.groupId),
        ).length,
        active: teacher.active,
      };
    });
  }

  private async teacherOrThrow(id: number): Promise<User> {
    const teacher = await this.users.findByPk(id);
    if (!teacher || teacher.role !== UserRole.Teacher) {
      throw new NotFoundException('Oʻqituvchi topilmadi');
    }
    return teacher;
  }
}
