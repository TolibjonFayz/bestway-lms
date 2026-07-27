export enum UserRole {
  Student = 'student',
  Teacher = 'teacher',
  Admin = 'admin',
}

/* CEFR bands the centre teaches. Staff accounts carry no level. */
export enum StudentLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
}

export enum CourseSubject {
  Ielts = 'ielts',
  Math = 'math',
  Science = 'science',
}

export enum LessonItemType {
  Video = 'video',
  Vocabulary = 'vocabulary',
  Test = 'test',
  Speaking = 'speaking',
}

export enum SubmissionStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Graded = 'graded',
  Returned = 'returned',
}

/* Attendance is recorded in Uzbek because that is what the register says and
   what teachers pick from — translating it in the UI would only add a mapping. */
export enum AttendanceStatus {
  Present = 'kelgan',
  Absent = 'kelmagan',
  Late = 'kechikkan',
  Excused = 'sababli',
}

/* Which lesson item types a subject may contain. Maths and science units have
   no vocabulary and no speaking — this is a hard rule, not an edge case. */
export const ITEM_TYPES_BY_SUBJECT: Readonly<
  Record<CourseSubject, readonly LessonItemType[]>
> = Object.freeze({
  [CourseSubject.Ielts]: [
    LessonItemType.Video,
    LessonItemType.Vocabulary,
    LessonItemType.Test,
    LessonItemType.Speaking,
  ],
  [CourseSubject.Math]: [LessonItemType.Video, LessonItemType.Test],
  [CourseSubject.Science]: [LessonItemType.Video, LessonItemType.Test],
});

export function isItemTypeAllowed(
  subject: CourseSubject,
  type: LessonItemType,
): boolean {
  return ITEM_TYPES_BY_SUBJECT[subject].includes(type);
}
