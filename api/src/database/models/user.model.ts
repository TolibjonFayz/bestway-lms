import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Index,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { StudentLevel, UserRole } from '@/common/enums';
import { Group } from './group.model';

@Table({ tableName: 'users', underscored: true })
export class User extends Model<User> {
  /* Nine digits, no +998 and no separators — the client strips the mask before
     it ever reaches us, so lookups never have to normalise. */
  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(9))
  declare phone: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING, field: 'password_hash' })
  declare passwordHash: string;

  @AllowNull(false)
  @Default(UserRole.Student)
  @Index
  @Column(DataType.ENUM(...Object.values(UserRole)))
  declare role: UserRole;

  @AllowNull(false)
  @Column({ type: DataType.STRING, field: 'full_name' })
  declare fullName: string;

  @Column({ type: DataType.STRING, field: 'avatar_url' })
  declare avatarUrl: string | null;

  /* Staff accounts have no CEFR level. */
  @Column(DataType.ENUM(...Object.values(StudentLevel)))
  declare level: StudentLevel | null;

  @ForeignKey(() => Group)
  @Column({ type: DataType.INTEGER, field: 'group_id' })
  declare groupId: number | null;

  /* Student records are never hard-deleted; they are deactivated. */
  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare active: boolean;

  @BelongsTo(() => Group, { foreignKey: 'groupId', as: 'group' })
  declare group?: Group;

  @HasMany(() => Group, { foreignKey: 'teacherId', as: 'taughtGroups' })
  declare taughtGroups?: Group[];
}
