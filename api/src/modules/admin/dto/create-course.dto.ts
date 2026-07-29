import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CourseSubject } from '@/common/enums';

export class CreateCourseDto {
  @IsString({ message: 'name matn boʻlishi kerak' })
  @MinLength(2, { message: 'name kamida 2 ta belgidan iborat boʻlishi kerak' })
  name!: string;

  @IsEnum(CourseSubject, { message: 'subject notoʻgʻri' })
  subject!: CourseSubject;

  @IsOptional()
  @IsString({ message: 'description matn boʻlishi kerak' })
  description?: string;
}
