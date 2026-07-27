import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Sequelize } from 'sequelize-typescript';
import { CourseSubject, UserRole } from '@/common/enums';
import { AppModule } from '@/app.module';
import { Group, User } from '@/database/models';
import { LessonItemsService } from '@/modules/lessons/lesson-items.service';
import { UsersService } from '@/modules/users/users.service';
import { seedAttendance, seedStudentActivity } from './activity';
import { seedCourses, SeededCourse } from './content';
import {
  SEED_ADMIN,
  SEED_GROUPS,
  SEED_STUDENTS,
  SEED_TEACHERS,
} from './data/people';
import { Rng } from './rng';

/* Tables are wiped in dependency order; RESTART IDENTITY keeps ids stable
   between runs so bookmarked URLs still point at the same records. */
const TABLES = [
  'attendance',
  'submissions',
  'progress',
  'refresh_tokens',
  'question_options',
  'questions',
  'tests',
  'vocab_words',
  'videos',
  'speaking_tasks',
  'lesson_items',
  'units',
  'courses',
];

/* Which course each seeded group is studying. MATH-1 does maths; the rest are
   the IELTS stream. */
const COURSE_SUBJECT_BY_GROUP: CourseSubject[] = [
  CourseSubject.Ielts,
  CourseSubject.Ielts,
  CourseSubject.Ielts,
  CourseSubject.Math,
];

async function run(): Promise<void> {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const config = app.get(ConfigService);
    const sequelize = app.get(Sequelize);
    const users = app.get(UsersService);
    const lessonItems = app.get(LessonItemsService);
    const rng = new Rng();

    if (config.getOrThrow<string>('env') === 'production') {
      throw new Error('Refusing to seed a production database.');
    }

    logger.log('Clearing existing data…');
    await sequelize.query(
      `TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE;`,
    );
    /* users and groups reference each other, so they are cleared together
       after everything that points at them has gone. */
    await sequelize.query('TRUNCATE TABLE "users", "groups" RESTART IDENTITY CASCADE;');

    const password = config.getOrThrow<string>('seedPassword');
    const passwordHash = await users.hashPassword(password);

    logger.log('Creating staff…');
    await User.create({
      phone: SEED_ADMIN.phone,
      passwordHash,
      role: UserRole.Admin,
      fullName: SEED_ADMIN.fullName,
      avatarUrl: null,
      level: null,
      groupId: null,
      active: true,
    } as Partial<User> as User);

    const teachers: User[] = [];
    for (const teacher of SEED_TEACHERS) {
      teachers.push(
        await User.create({
          phone: teacher.phone,
          passwordHash,
          role: UserRole.Teacher,
          fullName: teacher.fullName,
          avatarUrl: null,
          level: null,
          groupId: null,
          active: true,
        } as Partial<User> as User),
      );
    }

    logger.log('Creating groups…');
    const groups: Group[] = [];
    for (const spec of SEED_GROUPS) {
      groups.push(
        await Group.create({
          name: spec.name,
          teacherId: teachers[spec.teacherIndex].id,
          schedule: spec.schedule,
          branch: spec.branch,
        } as Partial<Group> as Group),
      );
    }

    logger.log('Creating students…');
    const students: User[] = [];
    const groupIndexByStudentId = new Map<number, number>();
    const studentsByGroupId = new Map<number, User[]>();

    for (const spec of SEED_STUDENTS) {
      const group = groups[spec.groupIndex];
      const student = await User.create({
        phone: spec.phone,
        passwordHash,
        role: UserRole.Student,
        fullName: spec.fullName,
        avatarUrl: null,
        level: spec.level,
        groupId: group.id,
        /* One inactive account so the soft-delete path has real data. */
        active: spec.phone !== '977409513',
      } as Partial<User> as User);

      students.push(student);
      groupIndexByStudentId.set(student.id, spec.groupIndex);
      const bucket = studentsByGroupId.get(group.id) ?? [];
      bucket.push(student);
      studentsByGroupId.set(group.id, bucket);
    }

    logger.log('Creating courses, units and lesson items…');
    const courses = await seedCourses(lessonItems, rng);
    const courseBySubject = new Map<CourseSubject, SeededCourse>(
      courses.map((course) => [course.subject, course]),
    );
    const courseByGroupIndex = new Map<number, SeededCourse>();
    COURSE_SUBJECT_BY_GROUP.forEach((subject, index) => {
      const course = courseBySubject.get(subject);
      if (course) courseByGroupIndex.set(index, course);
    });

    logger.log('Creating progress and submissions…');
    const activity = await seedStudentActivity(
      students.filter((student) => student.active),
      courseByGroupIndex,
      groupIndexByStudentId,
      teachers.map((teacher) => teacher.id),
      rng,
    );

    logger.log('Creating attendance…');
    const attendanceRows = await seedAttendance(groups, studentsByGroupId, rng);

    const lessonItemCount = courses.reduce((sum, c) => sum + c.items.length, 0);
    logger.log('─'.repeat(56));
    logger.log(`admin: 1 · teachers: ${teachers.length} · students: ${students.length}`);
    logger.log(`groups: ${groups.length} · courses: ${courses.length} · lesson items: ${lessonItemCount}`);
    logger.log(`progress: ${activity.progress} · submissions: ${activity.submissions} · attendance: ${attendanceRows}`);
    logger.log(`Every account's password is "${password}".`);
    logger.log(`Try: ${SEED_TEACHERS[0].phone} (${SEED_TEACHERS[0].fullName}, teacher)`);
    logger.log(`     ${SEED_STUDENTS[0].phone} (${SEED_STUDENTS[0].fullName}, student)`);
    logger.log('─'.repeat(56));
  } finally {
    await app.close();
  }
}

run().catch((error: unknown) => {
  new Logger('Seed').error(
    error instanceof Error ? error.message : String(error),
    error instanceof Error ? error.stack : undefined,
  );
  process.exitCode = 1;
});
