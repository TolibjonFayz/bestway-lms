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
import { LessonItem } from './lesson-item.model';

@Table({ tableName: 'videos', underscored: true })
export class Video extends Model<Video> {
  @ForeignKey(() => LessonItem)
  @AllowNull(false)
  @Unique
  @Column({ type: DataType.INTEGER, field: 'lesson_item_id' })
  declare lessonItemId: number;

  /* Where the file lives is still an open question for the centre (YouTube
     unlisted vs Vimeo vs own server), so this stays a plain URL. */
  @AllowNull(false)
  @Column(DataType.STRING(1024))
  declare url: string;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'duration_seconds' })
  declare durationSeconds: number;

  @Column({ type: DataType.STRING(1024), field: 'thumbnail_url' })
  declare thumbnailUrl: string | null;

  @BelongsTo(() => LessonItem, { foreignKey: 'lessonItemId', as: 'lessonItem' })
  declare lessonItem?: LessonItem;
}
