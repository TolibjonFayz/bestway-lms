import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CENTER_SETTINGS_ID, CenterSettings } from '@/database/models';
import { UpdateCenterSettingsDto } from './dto/center-settings.dto';

export interface CenterSettingsDto {
  theme: string;
  centerName: string;
  phone: string | null;
  address: string | null;
  coinsPerVocabulary: number;
  coinsPerTest: number;
}

@Injectable()
export class CenterSettingsService {
  constructor(
    @InjectModel(CenterSettings) private readonly settings: typeof CenterSettings,
  ) {}

  async get(): Promise<CenterSettingsDto> {
    return this.toDto(await this.row());
  }

  async update(dto: UpdateCenterSettingsDto): Promise<CenterSettingsDto> {
    const row = await this.row();

    /* Only the keys actually sent are written, so saving the theme from the
       gallery cannot blank out the centre's phone number. */
    const changes: Partial<CenterSettings> = {};
    if (dto.theme !== undefined) changes.theme = dto.theme;
    if (dto.centerName !== undefined) changes.centerName = dto.centerName.trim();
    if (dto.phone !== undefined) changes.phone = dto.phone.trim() || null;
    if (dto.address !== undefined) changes.address = dto.address.trim() || null;
    if (dto.coinsPerVocabulary !== undefined) {
      changes.coinsPerVocabulary = dto.coinsPerVocabulary;
    }
    if (dto.coinsPerTest !== undefined) changes.coinsPerTest = dto.coinsPerTest;

    if (Object.keys(changes).length) await row.update(changes);
    return this.toDto(row);
  }

  /* The row is seeded by the migration; recreated defensively so a wiped
     table cannot take the whole app down. */
  private async row(): Promise<CenterSettings> {
    const [row] = await this.settings.findOrCreate({
      where: { id: CENTER_SETTINGS_ID },
      defaults: { id: CENTER_SETTINGS_ID } as Partial<CenterSettings> as CenterSettings,
    });
    return row;
  }

  private toDto(row: CenterSettings): CenterSettingsDto {
    return {
      theme: row.theme,
      centerName: row.centerName,
      phone: row.phone,
      address: row.address,
      coinsPerVocabulary: row.coinsPerVocabulary,
      coinsPerTest: row.coinsPerTest,
    };
  }
}
