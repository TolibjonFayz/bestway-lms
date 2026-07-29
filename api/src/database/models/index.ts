import { Announcement } from './announcement.model';
import { Attendance } from './attendance.model';
import { CoinAward } from './coin-award.model';
import { Course } from './course.model';
import { Enrollment } from './enrollment.model';
import { Group } from './group.model';
import { LessonItem } from './lesson-item.model';
import { Progress } from './progress.model';
import { Question } from './question.model';
import { QuestionOption } from './question-option.model';
import { RefreshToken } from './refresh-token.model';
import { SpeakingTask } from './speaking-task.model';
import { Submission } from './submission.model';
import { Test } from './test.model';
import { Unit } from './unit.model';
import { User } from './user.model';
import { Video } from './video.model';
import { VocabWord } from './vocab-word.model';
import { VocabWordProgress } from './vocab-word-progress.model';

export {
  Announcement,
  Attendance,
  CoinAward,
  Course,
  Enrollment,
  Group,
  LessonItem,
  Progress,
  Question,
  QuestionOption,
  RefreshToken,
  SpeakingTask,
  Submission,
  Test,
  Unit,
  User,
  Video,
  VocabWord,
  VocabWordProgress,
};

export { ScheduleSlot } from './group.model';
export { AnnouncementTone } from './announcement.model';
export { CoinReason } from './coin-award.model';
export { MASTERED_LEVEL } from './vocab-word-progress.model';

/** Every model, for SequelizeModule.forRoot(). */
export const ALL_MODELS = [
  Announcement,
  Attendance,
  CoinAward,
  Course,
  Enrollment,
  Group,
  LessonItem,
  Progress,
  Question,
  QuestionOption,
  RefreshToken,
  SpeakingTask,
  Submission,
  Test,
  Unit,
  User,
  Video,
  VocabWord,
  VocabWordProgress,
];
