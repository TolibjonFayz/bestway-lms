import { Attendance } from './attendance.model';
import { Course } from './course.model';
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

export {
  Attendance,
  Course,
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
};

export { ScheduleSlot } from './group.model';

/** Every model, for SequelizeModule.forRoot(). */
export const ALL_MODELS = [
  Attendance,
  Course,
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
];
