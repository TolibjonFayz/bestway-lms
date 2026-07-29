import { IsEnum, IsString, MinLength } from 'class-validator';
import { LessonItemType } from '@/common/enums';

export class CreateLessonItemDto {
  @IsEnum(LessonItemType, { message: 'type notoʻgʻri' })
  type!: LessonItemType;

  @IsString({ message: 'title matn boʻlishi kerak' })
  @MinLength(2, { message: 'title kamida 2 ta belgidan iborat boʻlishi kerak' })
  title!: string;
}
