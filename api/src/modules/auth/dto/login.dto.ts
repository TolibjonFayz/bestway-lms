import { IsString, Length, Matches, MinLength } from 'class-validator';

export class LoginDto {
  /* Nine digits, no +998 — the client strips its own mask before sending. */
  @IsString({ message: 'phone matn boʻlishi kerak' })
  @Length(9, 9, { message: 'phone 9 ta raqamdan iborat boʻlishi kerak' })
  @Matches(/^\d{9}$/, { message: 'phone faqat raqamlardan iborat boʻlishi kerak' })
  phone!: string;

  @IsString({ message: 'password matn boʻlishi kerak' })
  @MinLength(6, { message: 'password kamida 6 ta belgidan iborat boʻlishi kerak' })
  password!: string;
}
