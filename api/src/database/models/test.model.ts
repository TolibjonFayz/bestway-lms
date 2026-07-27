import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { LessonItem } from './lesson-item.model';
import { Question } from './question.model';

@Table({ tableName: 'tests', underscored: true })
export class Test extends Model<Test> {
  @ForeignKey(() => LessonItem)
  @AllowNull(false)
  @Unique
  @Column({ type: DataType.INTEGER, field: 'lesson_item_id' })
  declare lessonItemId: number;

  /* Whole percent, never a float — same rule as scores and coins. */
  @AllowNull(false)
  @Default(60)
  @Column({ type: DataType.INTEGER, field: 'pass_score' })
  declare passScore: number;

  @Column({ type: DataType.INTEGER, field: 'time_limit_seconds' })
  declare timeLimitSeconds: number | null;

  @AllowNull(false)
  @Default(1)
  @Column({ type: DataType.INTEGER, field: 'attempts_allowed' })
  declare attemptsAllowed: number;

  @BelongsTo(() => LessonItem, { foreignKey: 'lessonItemId', as: 'lessonItem' })
  declare lessonItem?: LessonItem;

  @HasMany(() => Question, { foreignKey: 'testId', as: 'questions' })
  declare questions?: Question[];
}
