import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { fromLocal, localParts, localWeekStart } from '@/common/tashkent';
import { Group, User } from '@/database/models';
import { RatingQueryDto } from './dto/rating-query.dto';
import { RankRowDto, RatingDto, RatingPeriod, RatingScope } from './rating.types';

interface PoolRow {
  studentId: number;
  points: number;
}

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    private readonly sequelize: Sequelize,
  ) {}

  async forStudent(studentId: number, query: RatingQueryDto): Promise<RatingDto> {
    const student = await this.users.findByPk(studentId, {
      include: [{ model: Group, as: 'group' }],
    });
    if (!student) throw new NotFoundException('Foydalanuvchi topilmadi');

    const pool = await this.rankedPool(student, query.scope, query.period);
    const total = pool.length;
    const offset = (query.page - 1) * query.limit;
    const pageSlice = pool.slice(offset, offset + query.limit);

    const meIndex = pool.findIndex((row) => row.studentId === studentId);
    const neededIds = new Set(pageSlice.map((row) => row.studentId));
    if (meIndex !== -1) neededIds.add(studentId);

    const users = await this.users.findAll({ where: { id: { [Op.in]: [...neededIds] } } });
    const byId = new Map(users.map((row) => [row.id, row]));

    const items = pageSlice.map((row, index) =>
      this.toRow(row, offset + index + 1, byId, studentId),
    );
    const me = meIndex === -1 ? null : this.toRow(pool[meIndex], meIndex + 1, byId, studentId);

    return {
      scope: query.scope,
      period: query.period,
      items: { items, total, page: query.page, limit: query.limit },
      me,
    };
  }

  /* Same "highest score per item" collapsing as the dashboard's rank query,
     scoped to a group/branch/centre-wide pool and a week/month/all-time
     window. Fully materialised and ranked in one query — the result set is a
     few dozen rows at this centre's scale, so paginating it in JS afterwards
     (rather than with SQL LIMIT/OFFSET) is what lets `me` be picked out
     regardless of which page it lands on, without a second query. */
  private async rankedPool(
    student: User,
    scope: RatingScope,
    period: RatingPeriod,
  ): Promise<PoolRow[]> {
    const conditions = [`s.status IN ('graded', 'returned')`];
    const replacements: Record<string, unknown> = {};

    if (scope === RatingScope.Group) {
      if (!student.groupId) return [];
      conditions.push('u.group_id = :groupId');
      replacements.groupId = student.groupId;
    } else if (scope === RatingScope.Branch) {
      if (!student.group?.branch) return [];
      conditions.push('g.branch = :branch');
      replacements.branch = student.group.branch;
    }

    if (period === RatingPeriod.Week) {
      conditions.push('s.submitted_at >= :periodStart');
      replacements.periodStart = localWeekStart(new Date());
    } else if (period === RatingPeriod.Month) {
      const now = localParts(new Date());
      conditions.push('s.submitted_at >= :periodStart');
      replacements.periodStart = fromLocal(now.year, now.month, 1);
    }

    const needsGroupJoin = scope === RatingScope.Branch;
    const rows = await this.sequelize.query<{ student_id: number; pts: string }>(
      `SELECT student_id, SUM(best_score) AS pts
         FROM (
           SELECT s.student_id, s.lesson_item_id,
                  MAX(COALESCE(s.manual_score, s.auto_score)) AS best_score
             FROM submissions s
             JOIN users u ON u.id = s.student_id AND u.active = TRUE AND u.role = 'student'
             ${needsGroupJoin ? 'JOIN groups g ON g.id = u.group_id' : ''}
            WHERE ${conditions.join(' AND ')}
            GROUP BY s.student_id, s.lesson_item_id
         ) best
        GROUP BY student_id
       HAVING SUM(best_score) > 0
        ORDER BY pts DESC, student_id ASC`,
      { type: QueryTypes.SELECT, replacements },
    );

    return rows.map((row) => ({ studentId: Number(row.student_id), points: Number(row.pts) }));
  }

  private toRow(
    row: PoolRow,
    rank: number,
    byId: Map<number, User>,
    meId: number,
  ): RankRowDto {
    const user = byId.get(row.studentId);
    return {
      rank,
      studentId: row.studentId,
      fullName: user?.fullName ?? '',
      initials: this.initials(user?.fullName ?? ''),
      level: user?.level ?? null,
      points: row.points,
      isMe: row.studentId === meId,
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
