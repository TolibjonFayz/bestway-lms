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
import { QuestionOption } from './question-option.model';
import { Test } from './test.model';

@Table({ tableName: 'questions', underscored: true })
export class Question extends Model<Question> {
  @ForeignKey(() => Test)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'test_id' })
  declare testId: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'order_index' })
  declare orderIndex: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare prompt: string;

  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare points: number;

  @BelongsTo(() => Test, { foreignKey: 'testId', as: 'test' })
  declare test?: Test;

  @HasMany(() => QuestionOption, { foreignKey: 'questionId', as: 'options' })
  declare options?: QuestionOption[];
}
