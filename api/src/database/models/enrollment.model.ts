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
import { Course } from './course.model';
import { User } from './user.model';

/** Which courses a student is taking. A student may take more than one. */
@Table({ tableName: 'enrollments', underscored: true })
export class Enrollment extends Model<Enrollment> {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'student_id' })
  declare studentId: number;

  @ForeignKey(() => Course)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'course_id' })
  declare courseId: number;

  @AllowNull(false)
  @Column({ type: DataType.DATE, field: 'enrolled_at' })
  declare enrolledAt: Date;

  /* Dropping a course keeps the row, so past work stays attributable. */
  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare active: boolean;

  @BelongsTo(() => Course, { foreignKey: 'courseId', as: 'course' })
  declare course?: Course;

  @BelongsTo(() => User, { foreignKey: 'studentId', as: 'student' })
  declare student?: User;
}
