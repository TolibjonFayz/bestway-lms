import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'currentPassword matn boʻlishi kerak' })
  @MinLength(1, { message: 'currentPassword talab qilinadi' })
  currentPassword!: string;

  @IsString({ message: 'newPassword matn boʻlishi kerak' })
  @MinLength(6, { message: 'newPassword kamida 6 ta belgidan iborat boʻlishi kerak' })
  newPassword!: string;
}
