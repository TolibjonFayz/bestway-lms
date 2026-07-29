import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateVocabWordDto {
  @IsString({ message: 'wordEn matn boʻlishi kerak' })
  @MinLength(1, { message: 'wordEn talab qilinadi' })
  wordEn!: string;

  @IsString({ message: 'wordUz matn boʻlishi kerak' })
  @MinLength(1, { message: 'wordUz talab qilinadi' })
  wordUz!: string;

  @IsOptional()
  @IsString()
  transcription?: string;

  @IsOptional()
  @IsString()
  exampleEn?: string;
}
