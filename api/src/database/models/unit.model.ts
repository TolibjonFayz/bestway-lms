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
} from 'sequelize-typescript';
import { Course } from './course.model';
import { LessonItem } from './lesson-item.model';

@Table({ tableName: 'units', underscored: true })
export class Unit extends Model<Unit> {
  @ForeignKey(() => Course)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'course_id' })
  declare courseId: number;

  /* 1-based position inside the course; unique per course. */
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'order_index' })
  declare orderIndex: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare title: string;

  /* Units open as the student progresses; the first one is unlocked by hand. */
  @AllowNull(false)
  @Default(true)
  @Column({ type: DataType.BOOLEAN, field: 'is_locked_by_default' })
  declare isLockedByDefault: boolean;

  @BelongsTo(() => Course, { foreignKey: 'courseId', as: 'course' })
  declare course?: Course;

  @HasMany(() => LessonItem, { foreignKey: 'unitId', as: 'items' })
  declare items?: LessonItem[];
}
