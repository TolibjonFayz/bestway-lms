import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ExtraLessonStatus } from '@/common/enums';

export class CreateExtraLessonRequestDto {
  @IsString({ message: 'Mavzu matn boʻlishi kerak' })
  @MinLength(5, { message: 'Mavzu kamida 5 ta belgidan iborat boʻlishi kerak' })
  @MaxLength(500, { message: 'Mavzu 500 ta belgidan oshmasligi kerak' })
  topic!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'unitId butun son boʻlishi kerak' })
  @Min(1, { message: 'unitId notoʻgʻri' })
  unitId?: number;

  @IsOptional()
  @IsString({ message: 'Vaqt matn boʻlishi kerak' })
  @MaxLength(200, { message: 'Vaqt 200 ta belgidan oshmasligi kerak' })
  preferredTime?: string;
}

export class AnswerExtraLessonRequestDto {
  /* Only the two terminal answers, plus the "looking at it" state — a teacher
     cannot push a request back to "yuborildi". */
  @IsEnum(
    [
      ExtraLessonStatus.UnderReview,
      ExtraLessonStatus.Approved,
      ExtraLessonStatus.Rejected,
    ],
    { message: 'Holat notoʻgʻri' },
  )
  status!: ExtraLessonStatus;

  @IsOptional()
  @IsString({ message: 'Izoh matn boʻlishi kerak' })
  @MaxLength(1000, { message: 'Izoh 1000 ta belgidan oshmasligi kerak' })
  teacherNote?: string;
}
