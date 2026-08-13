import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UserRole } from '@/common/enums';
import { Paginated } from '@/common/types';
import { Group, User } from '@/database/models';
import { UsersService } from '../users/users.service';
import { ZoomService } from '../zoom/zoom.service';
import { AdminStudentsQueryDto } from './dto/admin-students-query.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { AdminGroupDto, AdminStudentDto } from './admin-people.types';

@Injectable()
export class AdminStudentsService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Group) private readonly groups: typeof Group,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly sequelize: Sequelize,
    private readonly zoom: ZoomService,
  ) {}

  async list(query: AdminStudentsQueryDto): Promise<Paginated<AdminStudentDto>> {
    const where: WhereOptions<User> = { role: UserRole.Student };
    if (query.status === 'active') where.active = true;
    else if (query.status === 'inactive') where.active = false;
    if (query.groupId) where.groupId = query.groupId;
    if (query.level) where.level = query.level;
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      (where as Record<symbol, unknown>)[Op.or] = [
        { fullName: { [Op.iLike]: term } },
        { phone: { [Op.iLike]: term } },
      ];
    }

    const { rows, count } = await this.users.findAndCountAll({
      where,
      include: [{ model: Group, as: 'group' }],
      order: [['fullName', 'ASC']],
      offset: (query.page - 1) * query.limit,
      limit: query.limit,
    });

    const ids = rows.map((row) => row.id);
    const [scores, attendance] = await Promise.all([
      this.averageScores(ids),
      this.attendancePercents(ids),
    ]);

    return {
      items: rows.map((row) => this.toDto(row, scores.get(row.id) ?? null, attendance.get(row.id) ?? null)),
      total: count,
      page: query.page,
      limit: query.limit,
    };
  }

  async create(dto: CreateStudentDto): Promise<AdminStudentDto> {
    const group = await this.groups.findByPk(dto.groupId);
    if (!group) throw new BadRequestException('Guruh topilmadi');

    const existing = await this.usersService.findByPhone(dto.phone);
    if (existing) throw new BadRequestException('Bu telefon raqami allaqachon roʻyxatdan oʻtgan');

    const password = this.config.getOrThrow<string>('seedPassword');
    const passwordHash = await this.usersService.hashPassword(password);

    const user = await this.users.create({
      phone: dto.phone,
      passwordHash,
      role: UserRole.Student,
      fullName: `${dto.firstName.trim()} ${dto.lastName.trim()}`,
      avatarUrl: null,
      level: dto.level,
      groupId: dto.groupId,
      active: true,
      notificationsEnabled: true,
    } as Partial<User> as User);

    return this.toDto(user, null, null);
  }

  async setStatus(id: number, active: boolean): Promise<AdminStudentDto> {
    const user = await this.requireStudent(id);
    await user.update({ active });
    return this.toDto(user, null, null);
  }

  async bulkSetStatus(ids: number[], active: boolean): Promise<{ updated: number }> {
    const [updated] = await this.users.update(
      { active },
      { where: { id: { [Op.in]: ids }, role: UserRole.Student } },
    );
    return { updated };
  }

  async listGroups(): Promise<AdminGroupDto[]> {
    const rows = await this.groups.findAll({ order: [['name', 'ASC']] });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      branch: row.branch,
      zoomJoinUrl: row.zoomJoinUrl ?? null,
    }));
  }

  get zoomConfigured(): boolean {
    return this.zoom.isConfigured;
  }

  /** Creates the group's recurring meeting via the Zoom API and stores its
      link — the automated counterpart to setGroupZoomUrl's manual paste. */
  async createGroupZoomMeeting(groupId: number): Promise<AdminGroupDto> {
    const group = await this.groups.findByPk(groupId);
    if (!group) throw new NotFoundException('Guruh topilmadi');

    const joinUrl = await this.zoom.createRecurringMeeting(`${group.name} — Best Way`);
    await group.update({ zoomJoinUrl: joinUrl });

    return { id: group.id, name: group.name, branch: group.branch, zoomJoinUrl: joinUrl };
  }

  /** Sets or clears a group's recurring Zoom link. */
  async setGroupZoomUrl(groupId: number, url: string | undefined): Promise<AdminGroupDto> {
    const group = await this.groups.findByPk(groupId);
    if (!group) throw new NotFoundException('Guruh topilmadi');

    await group.update({ zoomJoinUrl: url?.trim() || null });
    return {
      id: group.id,
      name: group.name,
      branch: group.branch,
      zoomJoinUrl: group.zoomJoinUrl,
    };
  }

  private async requireStudent(id: number): Promise<User> {
    const user = await this.users.findOne({ where: { id, role: UserRole.Student } });
    if (!user) throw new NotFoundException('Oʻquvchi topilmadi');
    return user;
  }

  private async averageScores(studentIds: number[]): Promise<Map<number, number>> {
    if (!studentIds.length) return new Map();
    const rows = await this.sequelize.query<{ student_id: number; avg_score: string }>(
      `SELECT student_id, AVG(COALESCE(manual_score, auto_score)) AS avg_score
         FROM submissions
        WHERE status IN ('graded', 'returned') AND student_id IN (:ids)
        GROUP BY student_id`,
      { type: QueryTypes.SELECT, replacements: { ids: studentIds } },
    );
    return new Map(rows.map((row) => [Number(row.student_id), Math.round(Number(row.avg_score))]));
  }

  private async attendancePercents(studentIds: number[]): Promise<Map<number, number>> {
    if (!studentIds.length) return new Map();
    const rows = await this.sequelize.query<{ student_id: number; pct: string }>(
      `SELECT student_id,
              ROUND(100.0 * SUM(CASE WHEN status IN ('kelgan', 'kechikkan') THEN 1 ELSE 0 END) / COUNT(*)) AS pct
         FROM attendance
        WHERE student_id IN (:ids)
        GROUP BY student_id`,
      { type: QueryTypes.SELECT, replacements: { ids: studentIds } },
    );
    return new Map(rows.map((row) => [Number(row.student_id), Math.round(Number(row.pct))]));
  }

  private toDto(
    user: User & { group?: Group },
    averageScore: number | null,
    attendancePercent: number | null,
  ): AdminStudentDto {
    return {
      id: user.id,
      fullName: user.fullName,
      initials: this.initials(user.fullName),
      phone: user.phone,
      groupId: user.groupId,
      groupName: user.group?.name ?? null,
      level: user.level,
      averageScore,
      attendancePercent,
      active: user.active,
    };
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
