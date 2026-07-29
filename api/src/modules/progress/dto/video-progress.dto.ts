import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class VideoProgressDto {
  @Type(() => Number)
  @IsInt({ message: 'lessonItemId butun son boʻlishi kerak' })
  @Min(1, { message: 'lessonItemId notoʻgʻri' })
  lessonItemId!: number;

  /** Whole percent watched, 0–100. */
  @Type(() => Number)
  @IsInt({ message: 'percent butun son boʻlishi kerak' })
  @Min(0, { message: 'percent 0 dan kichik boʻlmasligi kerak' })
  @Max(100, { message: 'percent 100 dan katta boʻlmasligi kerak' })
  percent!: number;

  /* Set by the "Darsni yakunlash" button. The server still checks the stored
     watched percentage before honouring it. */
  @IsOptional()
  @IsBoolean({ message: 'completed mantiqiy qiymat boʻlishi kerak' })
  completed?: boolean;
}
