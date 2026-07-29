import { IsBoolean } from 'class-validator';

export class UpdateStudentStatusDto {
  @IsBoolean({ message: 'active mantiqiy qiymat boʻlishi kerak' })
  active!: boolean;
}
