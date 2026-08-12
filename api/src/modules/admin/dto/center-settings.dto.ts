import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/* Kept in step with THEMES in web/src/composables/useTheme.js — an unknown id
   would leave every client falling back to the default with no way to tell why. */
export const THEME_IDS = [
  'bestway',
  'okean',
  'shafaq',
  'siyoh',
  'lavanda',
  'orzu',
  'gilos',
  'oltin',
  'neon',
  'sokin',
];

export class UpdateCenterSettingsDto {
  @IsOptional()
  @IsIn(THEME_IDS, { message: 'Mavzu notoʻgʻri' })
  theme?: string;

  @IsOptional()
  @IsString({ message: 'Nom matn boʻlishi kerak' })
  @MinLength(2, { message: 'Nom kamida 2 ta belgidan iborat boʻlishi kerak' })
  @MaxLength(120, { message: 'Nom 120 ta belgidan oshmasligi kerak' })
  centerName?: string;

  @IsOptional()
  @IsString({ message: 'Telefon matn boʻlishi kerak' })
  @MaxLength(32, { message: 'Telefon 32 ta belgidan oshmasligi kerak' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Manzil matn boʻlishi kerak' })
  @MaxLength(255, { message: 'Manzil 255 ta belgidan oshmasligi kerak' })
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tanga soni butun son boʻlishi kerak' })
  @Min(0, { message: 'Tanga soni manfiy boʻla olmaydi' })
  @Max(1000, { message: 'Tanga soni 1000 dan oshmasligi kerak' })
  coinsPerVocabulary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tanga soni butun son boʻlishi kerak' })
  @Min(0, { message: 'Tanga soni manfiy boʻla olmaydi' })
  @Max(1000, { message: 'Tanga soni 1000 dan oshmasligi kerak' })
  coinsPerTest?: number;
}
