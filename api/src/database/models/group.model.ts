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
import { User } from './user.model';

/** One recurring slot in a group's weekly timetable. */
export interface ScheduleSlot {
  /** Uzbek weekday name as it is shown in the UI, e.g. "seshanba". */
  day: string;
  /** 24-hour local (Asia/Tashkent) wall clock, e.g. "17:00". */
  start: string;
  end: string;
}

@Table({ tableName: 'groups', underscored: true })
export class Group extends Model<Group> {
  /* Centre-wide code such as "INT-3". */
  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, field: 'teacher_id' })
  declare teacherId: number | null;

  /* Free-form so the timetable can change shape without a migration. */
  @AllowNull(false)
  @Default([])
  @Column(DataType.JSONB)
  declare schedule: ScheduleSlot[];

  @AllowNull(false)
  @Column(DataType.STRING)
  declare branch: string;

  /** Recurring Zoom meeting link — the same one every lesson. */
  @Column({ type: DataType.STRING(500), field: 'zoom_join_url' })
  declare zoomJoinUrl: string | null;

  @BelongsTo(() => User, { foreignKey: 'teacherId', as: 'teacher' })
  declare teacher?: User;

  @HasMany(() => User, { foreignKey: 'groupId', as: 'students' })
  declare students?: User[];
}
