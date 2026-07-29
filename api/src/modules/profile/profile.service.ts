import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CourseSubject, LessonItemType, SubmissionStatus } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { localDateKey } from '@/common/tashkent';
import { Paginated } from '@/common/types';
import {
  Course,
  Enrollment,
  Group,
  LessonItem,
  MASTERED_LEVEL,
  Progress,
  Submission,
  Unit,
  User,
  VocabWordProgress,
} from '@/database/models';
import { effectiveScore } from '../dashboard/scoring';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { ACHIEVEMENT_CATALOG } from './achievements';
import { AchievementDto, ProfileDto } from './profile.types';

const STREAK_TARGET_DAYS = 7;
const VOCAB_MASTERED_TARGET = 50;
const TESTS_COMPLETED_TARGET = 10;

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Progress) private readonly progress: typeof Progress,
    @InjectModel(Submission) private readonly submissions: typeof Submission,
    @InjectModel(VocabWordProgress) private readonly vocabProgress: typeof VocabWordProgress,
    @InjectModel(Enrollment) private readonly enrollments: typeof Enrollment,
    private readonly usersService: UsersService,
    private readonly auth: AuthService,
  ) {}

  async getProfile(studentId: number): Promise<ProfileDto> {
    const user = await this.loadStudent(studentId);
    return {
      fullName: user.fullName,
      initials: this.initials(user.fullName),
      avatarUrl: user.avatarUrl,
      level: user.level,
      groupName: user.group?.name ?? null,
      branch: user.group?.branch ?? null,
      memberSince: user.createdAt.toISOString(),
      notificationsEnabled: user.notificationsEnabled,
    };
  }

  async getAchievements(
    studentId: number,
    page: PaginationDto,
  ): Promise<Paginated<AchievementDto>> {
    const earnedIds = await this.earnedAchievementIds(studentId);
    const all = ACHIEVEMENT_CATALOG.map((definition) => ({
      id: definition.id,
      icon: definition.icon,
      tone: definition.tone,
      earned: earnedIds.has(definition.id),
    }));

    const offset = (page.page - 1) * page.limit;
    return {
      items: all.slice(offset, offset + page.limit),
      total: all.length,
      page: page.page,
      limit: page.limit,
    };
  }

  async updateNotifications(studentId: number, enabled: boolean): Promise<{ enabled: boolean }> {
    const user = await this.loadStudent(studentId);
    await user.update({ notificationsEnabled: enabled });
    return { enabled };
  }

  /* Revokes every refresh token afterwards — a stolen-but-unused session
     should not survive its owner changing the password specifically to shut
     it out. The access token already issued still works until its own
     15-minute expiry, same as the existing reuse-detection revocation. */
  async changePassword(
    studentId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.loadStudent(studentId);
    const valid = await this.usersService.verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Joriy parol notoʻgʻri');
    }
    const passwordHash = await this.usersService.hashPassword(newPassword);
    await user.update({ passwordHash });
    await this.auth.revokeAllSessions(studentId);
  }

  private async loadStudent(studentId: number): Promise<User & { group?: Group }> {
    const user = await this.users.findByPk(studentId, {
      include: [{ model: Group, as: 'group' }],
    });
    if (!user || !user.active) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user as User & { group?: Group };
  }

  private async earnedAchievementIds(studentId: number): Promise<Set<string>> {
    const [streak, hasPerfect, vocabMastered, testsCompleted, ieltsMock] = await Promise.all([
      this.longestStreak(studentId),
      this.hasAnyPerfectScore(studentId),
      this.vocabProgress.count({ where: { studentId, level: { [Op.gte]: MASTERED_LEVEL } } }),
      this.distinctCompletedTests(studentId),
      this.hasCompletedIeltsCourse(studentId),
    ]);

    const earned = new Set<string>();
    if (streak >= STREAK_TARGET_DAYS) earned.add('streak_7');
    if (hasPerfect) earned.add('first_100');
    if (vocabMastered >= VOCAB_MASTERED_TARGET) earned.add('vocab_50');
    if (testsCompleted >= TESTS_COMPLETED_TARGET) earned.add('tests_10');
    if (ieltsMock) earned.add('ielts_mock');
    return earned;
  }

  /** Longest run of consecutive Tashkent calendar days on which the student
      touched a lesson item or had work graded, across their whole history. */
  private async longestStreak(studentId: number): Promise<number> {
    const [progressRows, submissionRows] = await Promise.all([
      this.progress.findAll({ where: { studentId }, attributes: ['completedAt', 'updatedAt'] }),
      this.submissions.findAll({
        where: { studentId, submittedAt: { [Op.ne]: null } },
        attributes: ['submittedAt'],
      }),
    ]);

    const dateKeys = new Set<string>();
    for (const row of progressRows) dateKeys.add(localDateKey(row.completedAt ?? row.updatedAt));
    for (const row of submissionRows) {
      if (row.submittedAt) dateKeys.add(localDateKey(row.submittedAt));
    }

    const sorted = [...dateKeys].sort();
    const DAY_MS = 86_400_000;
    let longest = 0;
    let current = 0;
    let previous: number | null = null;

    for (const key of sorted) {
      const time = new Date(key).getTime();
      current = previous !== null && time - previous === DAY_MS ? current + 1 : 1;
      longest = Math.max(longest, current);
      previous = time;
    }
    return longest;
  }

  private async hasAnyPerfectScore(studentId: number): Promise<boolean> {
    const [perfectProgress, gradedSubs] = await Promise.all([
      this.progress.count({ where: { studentId, percent: 100 } }),
      this.submissions.findAll({
        where: {
          studentId,
          status: { [Op.in]: [SubmissionStatus.Graded, SubmissionStatus.Returned] },
        },
        attributes: ['autoScore', 'manualScore'],
      }),
    ]);
    if (perfectProgress > 0) return true;
    return gradedSubs.some((sub) => effectiveScore(sub) === 100);
  }

  private async distinctCompletedTests(studentId: number): Promise<number> {
    const rows = await this.submissions.findAll({
      where: {
        studentId,
        status: { [Op.in]: [SubmissionStatus.Graded, SubmissionStatus.Returned] },
      },
      include: [
        {
          model: LessonItem,
          as: 'lessonItem',
          attributes: [],
          where: { type: LessonItemType.Test },
          required: true,
        },
      ],
      attributes: ['lessonItemId'],
    });
    return new Set(rows.map((row) => row.lessonItemId)).size;
  }

  /** Enrolled in an IELTS course and every lesson item across it sits at
      100% — the closest real signal this schema has to "finished a full
      mock run", short of building a dedicated mock-exam feature. */
  private async hasCompletedIeltsCourse(studentId: number): Promise<boolean> {
    const enrolments = await this.enrollments.findAll({
      where: { studentId, active: true },
      include: [
        {
          model: Course,
          as: 'course',
          where: { subject: CourseSubject.Ielts },
          include: [{ model: Unit, as: 'units', include: [{ model: LessonItem, as: 'items' }] }],
        },
      ],
    });
    if (!enrolments.length) return false;

    const itemIds = enrolments.flatMap((enrolment) =>
      (enrolment.course?.units ?? []).flatMap((unit) => (unit.items ?? []).map((item) => item.id)),
    );
    if (!itemIds.length) return false;

    const rows = await this.progress.findAll({
      where: { studentId, lessonItemId: { [Op.in]: itemIds } },
      attributes: ['lessonItemId', 'percent'],
    });
    const percentByItem = new Map(rows.map((row) => [row.lessonItemId, row.percent]));
    return itemIds.every((id) => percentByItem.get(id) === 100);
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
