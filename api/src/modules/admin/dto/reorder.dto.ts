import { Type } from 'class-transformer';
import { ArrayMinSize, IsInt, IsArray } from 'class-validator';

/** The new order, expressed as the full list of ids in their intended
    position — simpler and less error-prone than sending individual index
    patches. */
export class ReorderDto {
  @IsArray({ message: 'orderedIds roʻyxat boʻlishi kerak' })
  @ArrayMinSize(1, { message: 'orderedIds boʻsh boʻlmasligi kerak' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'orderedIds butun sonlardan iborat boʻlishi kerak' })
  orderedIds!: number[];
}
