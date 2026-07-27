import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { LessonItem } from './lesson-item.model';

@Table({ tableName: 'speaking_tasks', underscored: true })
export class SpeakingTask extends Model<SpeakingTask> {
  @ForeignKey(() => LessonItem)
  @AllowNull(false)
  @Unique
  @Column({ type: DataType.INTEGER, field: 'lesson_item_id' })
  declare lessonItemId: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare prompt: string;

  /* IELTS speaking part 1, 2 or 3 — null for non-IELTS practice. */
  @Column(DataType.INTEGER)
  declare part: number | null;

  @Column({ type: DataType.INTEGER, field: 'prep_seconds' })
  declare prepSeconds: number | null;

  @Column({ type: DataType.INTEGER, field: 'max_duration_seconds' })
  declare maxDurationSeconds: number | null;

  @BelongsTo(() => LessonItem, { foreignKey: 'lessonItemId', as: 'lessonItem' })
  declare lessonItem?: LessonItem;
}
