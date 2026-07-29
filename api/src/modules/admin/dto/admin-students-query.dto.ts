import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { StudentLevel } from '@/common/enums';

export class AdminStudentsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'groupId butun son boʻlishi kerak' })
  @Min(1)
  groupId?: number;

  @IsOptional()
  @IsIn(Object.values(StudentLevel), { message: 'level notoʻgʻri' })
  level?: StudentLevel;

  @IsOptional()
  @IsIn(['active', 'inactive', 'all'], { message: 'status active, inactive yoki all boʻlishi kerak' })
  status: 'active' | 'inactive' | 'all' = 'all';
}
