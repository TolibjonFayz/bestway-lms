import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { LessonItem } from './lesson-item.model';
import { User } from './user.model';

export enum CoinReason {
  VideoCompleted = 'video_completed',
  VocabularyCompleted = 'vocabulary_completed',
  TestCompleted = 'test_completed',
}

/* The coin ledger. One row per (student, item, reason) — the unique index in
   the migration is what makes awarding idempotent. */
@Table({ tableName: 'coin_awards', underscored: true })
export class CoinAward extends Model<CoinAward> {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'student_id' })
  declare studentId: number;

  @ForeignKey(() => LessonItem)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'lesson_item_id' })
  declare lessonItemId: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(CoinReason)))
  declare reason: CoinReason;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare amount: number;

  @AllowNull(false)
  @Column({ type: DataType.DATE, field: 'awarded_at' })
  declare awardedAt: Date;

  @BelongsTo(() => LessonItem, { foreignKey: 'lessonItemId', as: 'lessonItem' })
  declare lessonItem?: LessonItem;
}
