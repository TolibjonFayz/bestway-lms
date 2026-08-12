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
import { ExtraLessonStatus } from '@/common/enums';
import { Unit } from './unit.model';
import { User } from './user.model';

@Table({ tableName: 'extra_lesson_requests', underscored: true })
export class ExtraLessonRequest extends Model<ExtraLessonRequest> {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'student_id' })
  declare studentId: number;

  /** The unit the request is about, when it is about one. */
  @ForeignKey(() => Unit)
  @Column({ type: DataType.INTEGER, field: 'unit_id' })
  declare unitId: number | null;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare topic: string;

  /* Free text — "shanba kechqurun" is a real answer a picker cannot hold. */
  @Column({ type: DataType.STRING(200), field: 'preferred_time' })
  declare preferredTime: string | null;

  @AllowNull(false)
  @Default(ExtraLessonStatus.Sent)
  @Column(DataType.ENUM(...Object.values(ExtraLessonStatus)))
  declare status: ExtraLessonStatus;

  @Column({ type: DataType.TEXT, field: 'teacher_note' })
  declare teacherNote: string | null;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, field: 'answered_by' })
  declare answeredBy: number | null;

  @Column({ type: DataType.DATE, field: 'answered_at' })
  declare answeredAt: Date | null;

  @BelongsTo(() => User, { foreignKey: 'studentId', as: 'student' })
  declare student?: User;

  @BelongsTo(() => Unit, { foreignKey: 'unitId', as: 'unit' })
  declare unit?: Unit;
}
