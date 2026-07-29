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
import { CourseSubject } from '@/common/enums';
import { Unit } from './unit.model';
import { User } from './user.model';

@Table({ tableName: 'courses', underscored: true })
export class Course extends Model<Course> {
  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  /* Decides which lesson item types its units may hold — see
     ITEM_TYPES_BY_SUBJECT in common/enums.ts. */
  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(CourseSubject)))
  declare subject: CourseSubject;

  @Column(DataType.TEXT)
  declare description: string | null;

  @Column({ type: DataType.STRING, field: 'cover_url' })
  declare coverUrl: string | null;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare active: boolean;

  /* The teacher who owns the course, shown on the course card. Distinct from
     a group's teacher — a student's group may not own the course. */
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, field: 'teacher_id' })
  declare teacherId: number | null;

  @BelongsTo(() => User, { foreignKey: 'teacherId', as: 'teacher' })
  declare teacher?: User;

  @HasMany(() => Unit, { foreignKey: 'courseId', as: 'units' })
  declare units?: Unit[];
}
