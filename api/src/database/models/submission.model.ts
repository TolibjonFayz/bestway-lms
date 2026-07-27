import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { SubmissionStatus } from '@/common/enums';
import { LessonItem } from './lesson-item.model';
import { User } from './user.model';

@Table({ tableName: 'submissions', underscored: true })
export class Submission extends Model<Submission> {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'student_id' })
  declare studentId: number;

  @ForeignKey(() => LessonItem)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'lesson_item_id' })
  declare lessonItemId: number;

  /* Shape depends on the lesson item type: tests store
     { "<questionId>": <optionId> }, speaking stores { "audioUrl": "…" }. */
  @AllowNull(false)
  @Default({})
  @Column(DataType.JSONB)
  declare answers: Record<string, unknown>;

  /* Both scores are whole percents. Auto is machine-marked, manual is the
     teacher's override; the teacher's number wins when present. */
  @Column({ type: DataType.INTEGER, field: 'auto_score' })
  declare autoScore: number | null;

  @Column({ type: DataType.INTEGER, field: 'manual_score' })
  declare manualScore: number | null;

  @Column({ type: DataType.TEXT, field: 'teacher_comment' })
  declare teacherComment: string | null;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, field: 'graded_by' })
  declare gradedBy: number | null;

  @AllowNull(false)
  @Default(SubmissionStatus.Draft)
  @Column(DataType.ENUM(...Object.values(SubmissionStatus)))
  declare status: SubmissionStatus;

  @Column({ type: DataType.DATE, field: 'submitted_at' })
  declare submittedAt: Date | null;

  @Column({ type: DataType.DATE, field: 'graded_at' })
  declare gradedAt: Date | null;

  @BelongsTo(() => User, { foreignKey: 'studentId', as: 'student' })
  declare student?: User;

  @BelongsTo(() => User, { foreignKey: 'gradedBy', as: 'grader' })
  declare grader?: User;

  @BelongsTo(() => LessonItem, { foreignKey: 'lessonItemId', as: 'lessonItem' })
  declare lessonItem?: LessonItem;
}
