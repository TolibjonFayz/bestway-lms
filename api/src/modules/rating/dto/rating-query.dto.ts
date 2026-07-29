import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { RatingPeriod, RatingScope } from '../rating.types';

export class RatingQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(RatingScope, { message: 'scope group, branch yoki all boʻlishi kerak' })
  scope: RatingScope = RatingScope.Group;

  @IsOptional()
  @IsEnum(RatingPeriod, { message: 'period week, month yoki all boʻlishi kerak' })
  period: RatingPeriod = RatingPeriod.Week;
}
