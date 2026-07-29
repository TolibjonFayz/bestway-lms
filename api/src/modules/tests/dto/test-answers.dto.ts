import { IsObject } from 'class-validator';

/* Shape depends on the question type it answers (option id, free text, or a
   left-id → right-text map), so it is validated per-question in the service
   rather than here — a malformed entry just grades as incorrect. */
export class TestAnswersDto {
  @IsObject({ message: 'answers obyekt boʻlishi kerak' })
  answers!: Record<string, unknown>;
}
