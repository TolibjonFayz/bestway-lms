import { IsOptional, IsString, Matches } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class MarksQueryDto extends PaginationDto {
  /** "2026-02"; defaults to the current Tashkent month when omitted. */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'month YYYY-MM formatida boʻlishi kerak' })
  month?: string;
}
