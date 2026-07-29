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
import { QuestionType } from '@/common/enums';
import { QuestionOption } from './question-option.model';
import { Test } from './test.model';

@Table({ tableName: 'questions', underscored: true })
export class Question extends Model<Question> {
  @ForeignKey(() => Test)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'test_id' })
  declare testId: number;

  @AllowNull(false)
  @Default(QuestionType.MultipleChoice)
  @Column(DataType.ENUM(...Object.values(QuestionType)))
  declare type: QuestionType;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'order_index' })
  declare orderIndex: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare prompt: string;

  /* Shown on the result screen when the student gets it wrong; null falls
     back to a plain "Toʻgʻri javob: <text>" line. */
  @Column(DataType.TEXT)
  declare explanation: string | null;

  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare points: number;

  @BelongsTo(() => Test, { foreignKey: 'testId', as: 'test' })
  declare test?: Test;

  @HasMany(() => QuestionOption, { foreignKey: 'questionId', as: 'options' })
  declare options?: QuestionOption[];
}
