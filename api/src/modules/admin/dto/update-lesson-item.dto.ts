import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

/** Six hours — well past any lesson, but stops a typo storing a decade. */
const MAX_DURATION_SECONDS = 6 * 60 * 60;

export class UpdateLessonItemDto {
  @IsString({ message: 'title matn boʻlishi kerak' })
  @MinLength(2, { message: 'title kamida 2 ta belgidan iborat boʻlishi kerak' })
  title!: string;

  /* Video items only. The value is whatever the admin pasted — a YouTube link
     in any of its shapes, or a file URL for local development. The service
     normalises it and rejects anything it cannot recognise, so the shape check
     lives there rather than in a decorator that could not phrase the Uzbek
     error as precisely. */
  @IsOptional()
  @IsString({ message: 'Video havolasi matn boʻlishi kerak' })
  videoUrl?: string;

  @IsOptional()
  @IsInt({ message: 'Davomiylik butun son boʻlishi kerak' })
  @Min(0, { message: 'Davomiylik manfiy boʻla olmaydi' })
  @Max(MAX_DURATION_SECONDS, { message: 'Davomiylik juda katta' })
  videoDurationSeconds?: number;
}
