import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsString, Matches, ValidateNested } from 'class-validator';

const UZBEK_WEEKDAYS = [
  'dushanba',
  'seshanba',
  'chorshanba',
  'payshanba',
  'juma',
  'shanba',
  'yakshanba',
];

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export class ScheduleSlotDto {
  @IsString()
  @Matches(new RegExp(`^(${UZBEK_WEEKDAYS.join('|')})$`), {
    message: 'Kun nomi notoʻgʻri',
  })
  day: string;

  @IsString()
  @Matches(TIME, { message: 'Vaqt HH:MM koʻrinishida boʻlishi kerak' })
  start: string;

  @IsString()
  @Matches(TIME, { message: 'Vaqt HH:MM koʻrinishida boʻlishi kerak' })
  end: string;
}

export class UpdateGroupScheduleDto {
  @IsArray()
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotDto)
  schedule: ScheduleSlotDto[];
}
