import {
  AttendanceStatus,
  LessonItemType,
  QuestionType,
  SubmissionStatus,
} from '@/common/enums';
import { Attendance, Group, Progress, Submission, User } from '@/database/models';
import { SeededCourse } from './content';
import { Rng } from './rng';

const DAY_INDEX: Record<string, number> = {
  yakshanba: 0,
  dushanba: 1,
  seshanba: 2,
  chorshanba: 3,
  payshanba: 4,
  juma: 5,
  shanba: 6,
};

const TEACHER_COMMENTS = [
  'Yaxshi ish. Grammatikaga yana bir bor eʼtibor bering.',
  'Toʻgʻri javoblar koʻp, lekin yozuvda xatolar bor.',
  'Aʼlo darajada bajarilgan, shu tarzda davom eting.',
  'Bir nechta savolda shoshilgansiz — qaytadan koʻrib chiqing.',
  'Soʻz boyligingiz sezilarli oʻsdi.',
  'Vazifa toʻliq bajarilmagan, qolgan qismini yuboring.',
];

const TWO_MONTHS_DAYS = 60;

function daysAgo(days: number, rng: Rng): Date {
  const now = new Date();
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  /* Study happens through the afternoon and evening — but a row dated today
     must not land in the future. */
  const latestHour = days === 0 ? Math.max(9, now.getHours()) : 21;
  date.setHours(rng.int(9, latestHour), rng.int(0, 59), rng.int(0, 59), 0);
  return date > now ? now : date;
}

/** Progress, submissions and grades spread across the last two months. */
export async function seedStudentActivity(
  students: User[],
  courseByGroupIndex: Map<number, SeededCourse>,
  groupIndexByStudentId: Map<number, number>,
  teacherIds: number[],
  rng: Rng,
): Promise<{ progress: number; submissions: number }> {
  let progressRows = 0;
  let submissionRows = 0;

  for (const student of students) {
    const groupIndex = groupIndexByStudentId.get(student.id);
    const course = groupIndex === undefined ? undefined : courseByGroupIndex.get(groupIndex);
    if (!course) continue;

    /* A pace per student so the ranking has a real spread rather than everyone
       sitting at the same percentage. */
    const pace = rng.next();
    const unitCount = new Set(course.items.map((item) => item.unitIndex)).size;
    const unitsDone = Math.max(1, Math.round(pace * (unitCount - 1)));
    const currentUnit = Math.min(unitsDone, unitCount - 1);

    for (const item of course.items) {
      if (item.unitIndex > currentUnit) continue;

      const finished = item.unitIndex < currentUnit;
      /* The unit in progress is genuinely partial — some items untouched. */
      if (!finished && rng.bool(0.35)) continue;

      const percent = finished ? 100 : rng.pick([20, 40, 60, 60, 80]);
      /* Older units were finished earlier; spread backwards from today. */
      const ageDays = Math.round(
        ((currentUnit - item.unitIndex) / Math.max(1, currentUnit)) * TWO_MONTHS_DAYS,
      );
      /* The unit in progress is worked on across the current week, so the
         dashboard's streak strip reflects genuine recent rows. */
      const touchedAt = daysAgo(Math.max(0, ageDays + rng.int(-3, 3)), rng);

      await Progress.create({
        studentId: student.id,
        lessonItemId: item.id,
        percent,
        completedAt: percent === 100 ? touchedAt : null,
        createdAt: touchedAt,
        updatedAt: touchedAt,
      } as Partial<Progress> as Progress, { silent: true });
      progressRows += 1;

      /* Speaking has no auto-grader — a human always marks it, so the seed
         mints only a manual score, same as the real grading queue would. */
      if (item.type === LessonItemType.Speaking) {
        const awaitingGrade = ageDays <= 5 && rng.bool(0.5);
        const gradedAt = awaitingGrade ? null : daysAgo(Math.max(0, ageDays - 1), rng);
        const manualScore = Math.min(100, Math.max(0, Math.round(55 + pace * 40 + rng.int(-8, 8))));

        await Submission.create({
          studentId: student.id,
          lessonItemId: item.id,
          answers: {},
          autoScore: null,
          manualScore: awaitingGrade ? null : manualScore,
          teacherComment: awaitingGrade ? null : rng.pick(TEACHER_COMMENTS),
          gradedBy: awaitingGrade ? null : rng.pick(teacherIds),
          status: awaitingGrade ? SubmissionStatus.Submitted : SubmissionStatus.Graded,
          submittedAt: touchedAt,
          gradedAt,
          createdAt: touchedAt,
          updatedAt: gradedAt ?? touchedAt,
        } as Partial<Submission> as Submission, { silent: true });
        submissionRows += 1;
        continue;
      }

      if (item.type !== LessonItemType.Test) continue;

      const test = course.tests.get(item.id);
      if (!test) continue;

      /* Stronger students get more answers right; nobody is perfect. */
      const accuracy = 0.45 + pace * 0.5;
      const answers: Record<string, unknown> = {};
      let earnedPoints = 0;
      let totalPoints = 0;
      for (const question of test.questions) {
        /* No machine-checkable answer — excluded from the auto-graded total
           entirely, same as TestsService.evaluate(). A student who skips it
           just leaves it blank, same as any other essay question. */
        if (question.type === QuestionType.Open) {
          answers[String(question.id)] = rng.bool(0.85)
            ? 'Bu mavzu men uchun muhim, chunki kelajakda foydali boʻladi. Shu maqsad sari harakat qilaman.'
            : '';
          continue;
        }

        totalPoints += question.points;
        const gotItRight = rng.bool(accuracy);

        if (question.type === QuestionType.Matching && question.pairs) {
          const rightTexts = question.pairs.map((pair) => pair.rightText);
          /* A wrong attempt rotates the right-hand terms by one so every
             pair is mismatched rather than picking obviously-random text. */
          const offered = gotItRight
            ? rightTexts
            : [...rightTexts.slice(1), rightTexts[0]];
          const chosen: Record<string, string> = {};
          question.pairs.forEach((pair, index) => {
            chosen[String(pair.leftOptionId)] = offered[index];
          });
          answers[String(question.id)] = chosen;
        } else if (question.type === QuestionType.FillBlank) {
          answers[String(question.id)] = gotItRight
            ? question.correctText
            : rng.pick(question.wrongTexts ?? [question.correctText]);
        } else {
          answers[String(question.id)] = gotItRight
            ? question.correctOptionId
            : rng.pick(question.wrongOptionIds ?? []);
        }

        if (gotItRight) earnedPoints += question.points;
      }
      const autoScore = totalPoints
        ? Math.round((earnedPoints / totalPoints) * 100)
        : 0;

      /* Only the last few days are still waiting on a teacher. */
      const awaitingGrade = ageDays <= 5 && rng.bool(0.5);
      const gradedAt = awaitingGrade ? null : daysAgo(Math.max(0, ageDays - 1), rng);

      await Submission.create({
        studentId: student.id,
        lessonItemId: item.id,
        answers,
        autoScore,
        /* Teachers nudge the machine mark by a few points, or leave it. */
        manualScore: awaitingGrade
          ? null
          : Math.min(100, Math.max(0, autoScore + rng.int(-5, 8))),
        teacherComment: awaitingGrade ? null : rng.pick(TEACHER_COMMENTS),
        gradedBy: awaitingGrade ? null : rng.pick(teacherIds),
        status: awaitingGrade ? SubmissionStatus.Submitted : SubmissionStatus.Graded,
        submittedAt: touchedAt,
        gradedAt,
        createdAt: touchedAt,
        updatedAt: gradedAt ?? touchedAt,
      } as Partial<Submission> as Submission, { silent: true });
      submissionRows += 1;
    }
  }

  return { progress: progressRows, submissions: submissionRows };
}

/** One register row per student per scheduled lesson in the last two months. */
export async function seedAttendance(
  groups: Group[],
  studentsByGroupId: Map<number, User[]>,
  rng: Rng,
): Promise<number> {
  const rows: Partial<Attendance>[] = [];
  const today = new Date();

  for (const group of groups) {
    const students = studentsByGroupId.get(group.id) ?? [];
    if (!students.length) continue;

    const weekdays = new Set(
      group.schedule
        .map((slot) => DAY_INDEX[slot.day])
        .filter((day): day is number => day !== undefined),
    );

    for (let back = TWO_MONTHS_DAYS; back >= 0; back -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - back);
      if (!weekdays.has(date.getDay())) continue;

      const isoDate = date.toISOString().slice(0, 10);
      for (const student of students) {
        rows.push({
          studentId: student.id,
          groupId: group.id,
          date: isoDate,
          /* Roughly the real mix: mostly present, the odd absence. */
          status: rng.bool(0.86)
            ? AttendanceStatus.Present
            : rng.bool(0.45)
              ? AttendanceStatus.Late
              : rng.bool(0.5)
                ? AttendanceStatus.Excused
                : AttendanceStatus.Absent,
        });
      }
    }
  }

  await Attendance.bulkCreate(rows as unknown as Attendance[]);
  return rows.length;
}
