import { IsBoolean, IsString, MinLength } from 'class-validator';

export class QuestionOptionInputDto {
  @IsString({ message: 'text matn boʻlishi kerak' })
  @MinLength(1, { message: 'text boʻsh boʻlmasligi kerak' })
  text!: string;

  @IsBoolean({ message: 'isCorrect mantiqiy qiymat boʻlishi kerak' })
  isCorrect!: boolean;
}
