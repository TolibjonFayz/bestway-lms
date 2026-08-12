import { IsBoolean, IsDefined, IsInt, Min } from 'class-validator';

export class PracticeWordAnswerDto {
  @IsInt({ message: 'vocabWordId butun son boʻlishi kerak' })
  @Min(1, { message: 'vocabWordId notoʻgʻri' })
  vocabWordId!: number;

  @IsBoolean({ message: 'correct mantiqiy qiymat boʻlishi kerak' })
  correct!: boolean;
}

export class PracticeMistakeAnswerDto {
  @IsInt({ message: 'questionId butun son boʻlishi kerak' })
  @Min(1, { message: 'questionId notoʻgʻri' })
  questionId!: number;

  /* Shape depends on the question type — an option id, typed text, or a
     matching map — so it is validated by grade() rather than by class-validator. */
  @IsDefined({ message: 'answer yuborilishi kerak' })
  answer!: unknown;
}
