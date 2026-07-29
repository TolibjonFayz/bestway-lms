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
import { Question } from './question.model';

@Table({ tableName: 'question_options', underscored: true })
export class QuestionOption extends Model<QuestionOption> {
  @ForeignKey(() => Question)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'question_id' })
  declare questionId: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'order_index' })
  declare orderIndex: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare text: string;

  /* Never serialise this to a student — grading happens server-side. */
  @AllowNull(false)
  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_correct' })
  declare isCorrect: boolean;

  /* Matching questions only: the right-hand term `text` must be paired with.
     Never serialised before grading, same as isCorrect. */
  @Column({ type: DataType.TEXT, field: 'match_text' })
  declare matchText: string | null;

  @BelongsTo(() => Question, { foreignKey: 'questionId', as: 'question' })
  declare question?: Question;
}
