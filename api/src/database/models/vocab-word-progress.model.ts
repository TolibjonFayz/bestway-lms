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
import { User } from './user.model';
import { VocabWord } from './vocab-word.model';

/** A word is "yodlangan" once it has been answered correctly this many times. */
export const MASTERED_LEVEL = 3;

@Table({ tableName: 'vocab_word_progress', underscored: true })
export class VocabWordProgress extends Model<VocabWordProgress> {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'student_id' })
  declare studentId: number;

  @ForeignKey(() => VocabWord)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'vocab_word_id' })
  declare vocabWordId: number;

  /* 0 = yangi, 1–2 = oʻrganilmoqda, 3 = yodlangan. */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare level: number;

  @AllowNull(false)
  @Default(0)
  @Column({ type: DataType.INTEGER, field: 'correct_count' })
  declare correctCount: number;

  @AllowNull(false)
  @Default(0)
  @Column({ type: DataType.INTEGER, field: 'wrong_count' })
  declare wrongCount: number;

  @Column({ type: DataType.DATE, field: 'last_answered_at' })
  declare lastAnsweredAt: Date | null;

  @BelongsTo(() => VocabWord, { foreignKey: 'vocabWordId', as: 'word' })
  declare word?: VocabWord;
}
