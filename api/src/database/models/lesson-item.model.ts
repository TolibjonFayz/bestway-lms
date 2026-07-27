import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { LessonItemType } from '@/common/enums';
import { SpeakingTask } from './speaking-task.model';
import { Test } from './test.model';
import { Unit } from './unit.model';
import { Video } from './video.model';
import { VocabWord } from './vocab-word.model';

/* The polymorphic root of a lesson. `type` says which of the payload tables
   below carries the content; exactly one of them is populated. Storing the
   payload in typed tables rather than a JSON blob keeps questions and words
   queryable for grading and progress. */
@Table({ tableName: 'lesson_items', underscored: true })
export class LessonItem extends Model<LessonItem> {
  @ForeignKey(() => Unit)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'unit_id' })
  declare unitId: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(LessonItemType)))
  declare type: LessonItemType;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'order_index' })
  declare orderIndex: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare title: string;

  @BelongsTo(() => Unit, { foreignKey: 'unitId', as: 'unit' })
  declare unit?: Unit;

  @HasOne(() => Video, { foreignKey: 'lessonItemId', as: 'video' })
  declare video?: Video;

  @HasMany(() => VocabWord, { foreignKey: 'lessonItemId', as: 'vocabWords' })
  declare vocabWords?: VocabWord[];

  @HasOne(() => Test, { foreignKey: 'lessonItemId', as: 'test' })
  declare test?: Test;

  @HasOne(() => SpeakingTask, { foreignKey: 'lessonItemId', as: 'speakingTask' })
  declare speakingTask?: SpeakingTask;
}
