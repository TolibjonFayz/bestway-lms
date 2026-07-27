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
import { LessonItem } from './lesson-item.model';
import { User } from './user.model';

/* One row per student per lesson item — the unique index on that pair is what
   makes "how far am I" a single upsert rather than an event replay. */
@Table({ tableName: 'progress', underscored: true })
export class Progress extends Model<Progress> {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'student_id' })
  declare studentId: number;

  @ForeignKey(() => LessonItem)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'lesson_item_id' })
  declare lessonItemId: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare percent: number;

  @Column({ type: DataType.DATE, field: 'completed_at' })
  declare completedAt: Date | null;

  @BelongsTo(() => User, { foreignKey: 'studentId', as: 'student' })
  declare student?: User;

  @BelongsTo(() => LessonItem, { foreignKey: 'lessonItemId', as: 'lessonItem' })
  declare lessonItem?: LessonItem;
}
