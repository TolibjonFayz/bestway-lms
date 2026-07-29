import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class TeacherSubmissionsQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['pending', 'graded', 'all'], { message: 'status pending, graded yoki all boʻlishi kerak' })
  status: 'pending' | 'graded' | 'all' = 'pending';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'groupId butun son boʻlishi kerak' })
  @Min(1)
  groupId?: number;
}
