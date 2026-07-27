import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { CourseSubject } from '@/common/enums';
import { Unit } from './unit.model';

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

  @HasMany(() => Unit, { foreignKey: 'courseId', as: 'units' })
  declare units?: Unit[];
}
