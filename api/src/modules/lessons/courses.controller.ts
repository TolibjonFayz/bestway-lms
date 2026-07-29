import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UserRole } from '@/common/enums';
import { JwtPayload, Paginated } from '@/common/types';
import { CoursesService } from './courses.service';
import { CourseSummaryDto, UnitDetailDto, UnitSummaryDto } from './lessons.types';

@Controller()
@Roles(UserRole.Student)
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get('courses')
  list(
    @CurrentUser() user: JwtPayload,
    @Query() page: PaginationDto,
  ): Promise<Paginated<CourseSummaryDto>> {
    return this.courses.listForStudent(user.sub, page);
  }

  @Get('courses/:id/units')
  units(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) courseId: number,
    @Query() page: PaginationDto,
  ): Promise<Paginated<UnitSummaryDto>> {
    return this.courses.listUnits(user.sub, courseId, page);
  }

  @Get('units/:id')
  unit(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) unitId: number,
  ): Promise<UnitDetailDto> {
    return this.courses.unitDetail(user.sub, unitId);
  }
}
