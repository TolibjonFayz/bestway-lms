import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Query shape every list endpoint accepts. */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page butun son boʻlishi kerak' })
  @Min(1, { message: 'page 1 dan kichik boʻlmasligi kerak' })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit butun son boʻlishi kerak' })
  @Min(1, { message: 'limit 1 dan kichik boʻlmasligi kerak' })
  @Max(100, { message: 'limit 100 dan katta boʻlmasligi kerak' })
  limit = 20;

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
