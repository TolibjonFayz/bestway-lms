import { AllowNull, Column, DataType, Default, Model, Table } from 'sequelize-typescript';

/** The single settings row. Always id = 1 — see the migration. */
export const CENTER_SETTINGS_ID = 1;

@Table({ tableName: 'center_settings', underscored: true })
export class CenterSettings extends Model<CenterSettings> {
  @AllowNull(false)
  @Default('bestway')
  @Column(DataType.STRING(32))
  declare theme: string;

  @AllowNull(false)
  @Default('Best Way')
  @Column({ type: DataType.STRING(120), field: 'center_name' })
  declare centerName: string;

  @Column(DataType.STRING(32))
  declare phone: string | null;

  @Column(DataType.STRING(255))
  declare address: string | null;

  @AllowNull(false)
  @Default(25)
  @Column({ type: DataType.INTEGER, field: 'coins_per_vocabulary' })
  declare coinsPerVocabulary: number;

  @AllowNull(false)
  @Default(30)
  @Column({ type: DataType.INTEGER, field: 'coins_per_test' })
  declare coinsPerTest: number;
}
