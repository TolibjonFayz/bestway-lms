import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsString, MinLength, ValidateNested } from 'class-validator';
import { QuestionOptionInputDto } from './question-option-input.dto';

/* Multiple choice only — the admin editor never authors fill_blank, matching
   or open questions (those come from the seed and stay read-only here). */
export class SaveQuestionDto {
  @IsString({ message: 'prompt matn boʻlishi kerak' })
  @MinLength(2, { message: 'prompt kamida 2 ta belgidan iborat boʻlishi kerak' })
  prompt!: string;

  @IsArray({ message: 'options roʻyxat boʻlishi kerak' })
  @ArrayMinSize(2, { message: 'kamida 2 ta variant kerak' })
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionInputDto)
  options!: QuestionOptionInputDto[];
}
