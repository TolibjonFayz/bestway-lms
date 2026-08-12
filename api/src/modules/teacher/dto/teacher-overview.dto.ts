import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class TeacherTasksQueryDto {
  /** Restrict to one of the teacher's own groups; omitted means all of them. */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'groupId butun son boʻlishi kerak' })
  @Min(1, { message: 'groupId notoʻgʻri' })
  groupId?: number;
}

export class TeacherStudentsQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'groupId butun son boʻlishi kerak' })
  @Min(1, { message: 'groupId notoʻgʻri' })
  groupId?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
