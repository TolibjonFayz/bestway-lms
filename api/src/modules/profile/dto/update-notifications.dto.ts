import { IsBoolean } from 'class-validator';

export class UpdateNotificationsDto {
  @IsBoolean({ message: 'enabled mantiqiy qiymat boʻlishi kerak' })
  enabled!: boolean;
}
