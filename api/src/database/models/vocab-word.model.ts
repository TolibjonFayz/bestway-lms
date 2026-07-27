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

@Table({ tableName: 'vocab_words', underscored: true })
export class VocabWord extends Model<VocabWord> {
  @ForeignKey(() => LessonItem)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'lesson_item_id' })
  declare lessonItemId: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING, field: 'word_en' })
  declare wordEn: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING, field: 'word_uz' })
  declare wordUz: string;

  @Column(DataType.STRING)
  declare transcription: string | null;

  @Column({ type: DataType.TEXT, field: 'example_en' })
  declare exampleEn: string | null;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'order_index' })
  declare orderIndex: number;

  @BelongsTo(() => LessonItem, { foreignKey: 'lessonItemId', as: 'lessonItem' })
  declare lessonItem?: LessonItem;
}
