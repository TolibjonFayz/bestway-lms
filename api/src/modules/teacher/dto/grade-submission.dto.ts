import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GradeSubmissionDto {
  @Type(() => Number)
  @IsInt({ message: 'score butun son boʻlishi kerak' })
  @Min(0, { message: 'score 0 dan kichik boʻlmasligi kerak' })
  @Max(100, { message: 'score 100 dan katta boʻlmasligi kerak' })
  score!: number;

  @IsOptional()
  @IsString({ message: 'comment matn boʻlishi kerak' })
  comment?: string;
}
