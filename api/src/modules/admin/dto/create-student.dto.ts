import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, Length, Matches, MinLength } from 'class-validator';
import { StudentLevel } from '@/common/enums';

export class CreateStudentDto {
  @IsString({ message: 'firstName matn boʻlishi kerak' })
  @MinLength(2, { message: 'firstName kamida 2 ta belgidan iborat boʻlishi kerak' })
  firstName!: string;

  @IsString({ message: 'lastName matn boʻlishi kerak' })
  @MinLength(2, { message: 'lastName kamida 2 ta belgidan iborat boʻlishi kerak' })
  lastName!: string;

  @IsString({ message: 'phone matn boʻlishi kerak' })
  @Length(9, 9, { message: 'phone 9 ta raqamdan iborat boʻlishi kerak' })
  @Matches(/^\d{9}$/, { message: 'phone faqat raqamlardan iborat boʻlishi kerak' })
  phone!: string;

  @Type(() => Number)
  @IsInt({ message: 'groupId butun son boʻlishi kerak' })
  groupId!: number;

  @IsEnum(StudentLevel, { message: 'level notoʻgʻri' })
  level!: StudentLevel;
}
