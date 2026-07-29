import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsInt } from 'class-validator';

export class BulkStudentStatusDto {
  @IsArray({ message: 'ids roʻyxat boʻlishi kerak' })
  @ArrayMinSize(1, { message: 'ids boʻsh boʻlmasligi kerak' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'ids butun sonlardan iborat boʻlishi kerak' })
  ids!: number[];

  @IsBoolean({ message: 'active mantiqiy qiymat boʻlishi kerak' })
  active!: boolean;
}
