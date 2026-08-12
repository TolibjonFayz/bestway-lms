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

/* multiple_choice and fill_blank both use question_options as their answer
   set — fill_blank differs only in that the client shows a text input and
   grading compares typed text to the correct option, not an id. matching
   reuses the same rows as pairs (text = left term, matchText = right term).
   open has no options at all — there is no machine-checkable answer, so it
   never contributes to autoScore and always waits for a teacher. */
export enum QuestionType {
  MultipleChoice = 'multiple_choice',
  FillBlank = 'fill_blank',
  Matching = 'matching',
  Open = 'open',
}

/* Attendance is recorded in Uzbek because that is what the register says and
   what teachers pick from — translating it in the UI would only add a mapping. */
export enum ExtraLessonStatus {
  Sent = 'yuborildi',
  UnderReview = 'korib_chiqilmoqda',
  Approved = 'tasdiqlandi',
  Rejected = 'rad_etildi',
}

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
