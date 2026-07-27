import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @IsString({ message: 'refreshToken matn boʻlishi kerak' })
  @IsNotEmpty({ message: 'refreshToken boʻsh boʻlmasligi kerak' })
  refreshToken!: string;
}

export class LogoutDto {
  /* Omit it to end every session this user has open. */
  @IsOptional()
  @IsString({ message: 'refreshToken matn boʻlishi kerak' })
  refreshToken?: string;
}
