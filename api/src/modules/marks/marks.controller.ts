import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload } from '@/common/types';
import { MarksQueryDto } from './dto/marks-query.dto';
import { MarksService } from './marks.service';
import { MarksDto } from './marks.types';

@Controller('marks')
@Roles(UserRole.Student)
export class MarksController {
  constructor(private readonly marks: MarksService) {}

  @Get()
  get(
    @CurrentUser() user: JwtPayload,
    @Query() query: MarksQueryDto,
  ): Promise<MarksDto> {
    return this.marks.forStudent(user.sub, query);
  }
}
