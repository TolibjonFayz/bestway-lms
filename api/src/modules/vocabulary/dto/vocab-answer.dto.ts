import { Type } from 'class-transformer';
import { IsBoolean, IsInt, Min } from 'class-validator';

export class VocabAnswerDto {
  @Type(() => Number)
  @IsInt({ message: 'vocabWordId butun son boʻlishi kerak' })
  @Min(1, { message: 'vocabWordId notoʻgʻri' })
  vocabWordId!: number;

  /** "Bilaman" is true, "Bilmadim" is false. */
  @IsBoolean({ message: 'correct mantiqiy qiymat boʻlishi kerak' })
  correct!: boolean;
}
