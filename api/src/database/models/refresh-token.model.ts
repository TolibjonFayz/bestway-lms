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
import { User } from './user.model';

/* Refresh tokens rotate: every /auth/refresh revokes the presented token and
   issues a new one. Only the SHA-256 digest is stored, so a database dump does
   not hand out live sessions. */
@Table({ tableName: 'refresh_tokens', underscored: true })
export class RefreshToken extends Model<RefreshToken> {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'user_id' })
  declare userId: number;

  @AllowNull(false)
  @Unique
  @Column({ type: DataType.STRING(64), field: 'token_hash' })
  declare tokenHash: string;

  @AllowNull(false)
  @Column({ type: DataType.DATE, field: 'expires_at' })
  declare expiresAt: Date;

  @Column({ type: DataType.DATE, field: 'revoked_at' })
  declare revokedAt: Date | null;

  @Column({ type: DataType.STRING, field: 'user_agent' })
  declare userAgent: string | null;

  @BelongsTo(() => User, { foreignKey: 'userId', as: 'user' })
  declare user?: User;
}
