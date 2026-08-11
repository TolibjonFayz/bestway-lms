import { IsEnum, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@/common/enums';

export class AttendanceRegisterQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'groupId butun son boʻlishi kerak' })
  @Min(1, { message: 'groupId notoʻgʻri' })
  groupId!: number;

  /** "2026-08"; defaults to the current Tashkent month when omitted. */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'month YYYY-MM formatida boʻlishi kerak' })
  month?: string;
}

export class MarkAttendanceDto {
  @IsInt({ message: 'groupId butun son boʻlishi kerak' })
  @Min(1, { message: 'groupId notoʻgʻri' })
  groupId!: number;

  @IsInt({ message: 'studentId butun son boʻlishi kerak' })
  @Min(1, { message: 'studentId notoʻgʻri' })
  studentId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date YYYY-MM-DD formatida boʻlishi kerak' })
  date!: string;

  @IsEnum(AttendanceStatus, { message: 'Holat notoʻgʻri' })
  status!: AttendanceStatus;
}

export class ClearAttendanceDto {
  @Type(() => Number)
  @IsInt({ message: 'groupId butun son boʻlishi kerak' })
  @Min(1, { message: 'groupId notoʻgʻri' })
  groupId!: number;

  @Type(() => Number)
  @IsInt({ message: 'studentId butun son boʻlishi kerak' })
  @Min(1, { message: 'studentId notoʻgʻri' })
  studentId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date YYYY-MM-DD formatida boʻlishi kerak' })
  date!: string;
}

/** Marks every student in the group for one day — the "Hammasi kelgan" action. */
export class MarkDayDto {
  @IsInt({ message: 'groupId butun son boʻlishi kerak' })
  @Min(1, { message: 'groupId notoʻgʻri' })
  groupId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date YYYY-MM-DD formatida boʻlishi kerak' })
  date!: string;

  @IsEnum(AttendanceStatus, { message: 'Holat notoʻgʻri' })
  status!: AttendanceStatus;
}
