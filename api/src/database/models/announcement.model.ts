import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from 'sequelize-typescript';

export enum AnnouncementTone {
  Green = 'green',
  Orange = 'orange',
  Sky = 'sky',
  Muted = 'muted',
}

@Table({ tableName: 'announcements', underscored: true })
export class Announcement extends Model<Announcement> {
  @AllowNull(false)
  @Column(DataType.STRING)
  declare title: string;

  /* An icon name from the frontend kit, not a URL. */
  @AllowNull(false)
  @Column(DataType.STRING(40))
  declare icon: string;

  @AllowNull(false)
  @Default(AnnouncementTone.Green)
  @Column(DataType.ENUM(...Object.values(AnnouncementTone)))
  declare tone: AnnouncementTone;

  @Column(DataType.TEXT)
  declare body: string | null;

  @AllowNull(false)
  @Default(0)
  @Column({ type: DataType.INTEGER, field: 'order_index' })
  declare orderIndex: number;

  @AllowNull(false)
  @Column({ type: DataType.DATE, field: 'published_at' })
  declare publishedAt: Date;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare active: boolean;
}
