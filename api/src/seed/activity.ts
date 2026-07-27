import { AttendanceStatus, LessonItemType, SubmissionStatus } from '@/common/enums';
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
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(rng.int(9, 21), rng.int(0, 59), rng.int(0, 59), 0);
  return date;
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
      const touchedAt = daysAgo(Math.max(1, ageDays + rng.int(-4, 4)), rng);

      await Progress.create({
        studentId: student.id,
        lessonItemId: item.id,
        percent,
        completedAt: percent === 100 ? touchedAt : null,
        createdAt: touchedAt,
        updatedAt: touchedAt,
      } as Partial<Progress> as Progress, { silent: true });
      progressRows += 1;

      if (item.type !== LessonItemType.Test) continue;

      const test = course.tests.get(item.id);
      if (!test) continue;

      /* Stronger students get more answers right; nobody is perfect. */
      const accuracy = 0.45 + pace * 0.5;
      const answers: Record<string, number> = {};
      let correctCount = 0;
      for (const question of test.questions) {
        const gotItRight = rng.bool(accuracy);
        answers[String(question.id)] = gotItRight
          ? question.correctOptionId
          : rng.pick(question.wrongOptionIds);
        if (gotItRight) correctCount += 1;
      }
      const autoScore = Math.round((correctCount / test.questions.length) * 100);

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
