import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class AdminTeachersQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  /** "active" | "inactive"; omitted means both. */
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateTeacherDto {
  @IsString({ message: 'fullName matn boʻlishi kerak' })
  @MinLength(3, { message: 'Ism-familiya kamida 3 ta belgidan iborat boʻlishi kerak' })
  fullName!: string;

  @IsString({ message: 'phone matn boʻlishi kerak' })
  @Length(9, 9, { message: 'Telefon raqami 9 ta raqamdan iborat boʻlishi kerak' })
  @Matches(/^\d{9}$/, { message: 'Telefon faqat raqamlardan iborat boʻlishi kerak' })
  phone!: string;

  /* Set per teacher rather than reused from the seed config, so two accounts
     never share a credential. */
  @IsString({ message: 'password matn boʻlishi kerak' })
  @MinLength(8, { message: 'Parol kamida 8 ta belgidan iborat boʻlishi kerak' })
  password!: string;

  /** Groups to hand over to this teacher; may be empty. */
  @IsOptional()
  @IsArray({ message: 'groupIds roʻyxat boʻlishi kerak' })
  @IsInt({ each: true, message: 'groupIds butun sonlardan iborat boʻlishi kerak' })
  @Type(() => Number)
  groupIds?: number[];
}

export class UpdateTeacherDto {
  @IsOptional()
  @IsString({ message: 'fullName matn boʻlishi kerak' })
  @MinLength(3, { message: 'Ism-familiya kamida 3 ta belgidan iborat boʻlishi kerak' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: 'phone matn boʻlishi kerak' })
  @Length(9, 9, { message: 'Telefon raqami 9 ta raqamdan iborat boʻlishi kerak' })
  @Matches(/^\d{9}$/, { message: 'Telefon faqat raqamlardan iborat boʻlishi kerak' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'password matn boʻlishi kerak' })
  @MinLength(8, { message: 'Parol kamida 8 ta belgidan iborat boʻlishi kerak' })
  password?: string;

  @IsOptional()
  @IsArray({ message: 'groupIds roʻyxat boʻlishi kerak' })
  @IsInt({ each: true, message: 'groupIds butun sonlardan iborat boʻlishi kerak' })
  @Type(() => Number)
  groupIds?: number[];
}

export class UpdateTeacherStatusDto {
  @IsBoolean({ message: 'active mantiqiy qiymat boʻlishi kerak' })
  active!: boolean;
}
