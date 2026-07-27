import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AttendanceStatus } from '@/common/enums';
import { Group } from './group.model';
import { User } from './user.model';

@Table({ tableName: 'attendance', underscored: true })
export class Attendance extends Model<Attendance> {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'student_id' })
  declare studentId: number;

  /* Denormalised from the student so the register still reads correctly after
     a student moves to another group. */
  @ForeignKey(() => Group)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'group_id' })
  declare groupId: number;

  /* Calendar date in Asia/Tashkent, not a timestamp — a lesson belongs to a
     day, and DATEONLY keeps it from shifting across the UTC boundary. */
  @AllowNull(false)
  @Column(DataType.DATEONLY)
  declare date: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(AttendanceStatus)))
  declare status: AttendanceStatus;

  @BelongsTo(() => User, { foreignKey: 'studentId', as: 'student' })
  declare student?: User;

  @BelongsTo(() => Group, { foreignKey: 'groupId', as: 'group' })
  declare group?: Group;
}
