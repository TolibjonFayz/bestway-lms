import { IsString, MinLength } from 'class-validator';

export class CreateUnitDto {
  @IsString({ message: 'title matn boʻlishi kerak' })
  @MinLength(2, { message: 'title kamida 2 ta belgidan iborat boʻlishi kerak' })
  title!: string;
}
