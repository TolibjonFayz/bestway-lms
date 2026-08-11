import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { Paginated } from '@/common/types';
import { AdminOverviewService } from './admin-overview.service';
import { AdminOverviewDto } from './admin-overview.types';
import { AdminTeachersService } from './admin-teachers.service';
import { AdminTeacherDto } from './admin-people.types';
import {
  AdminTeachersQueryDto,
  CreateTeacherDto,
  UpdateTeacherDto,
  UpdateTeacherStatusDto,
} from './dto/teacher.dto';

@Controller('admin')
@Roles(UserRole.Admin)
export class AdminTeachersController {
  constructor(
    private readonly teachers: AdminTeachersService,
    private readonly overview: AdminOverviewService,
  ) {}

  @Get('overview')
  getOverview(): Promise<AdminOverviewDto> {
    return this.overview.build();
  }

  @Get('teachers')
  list(@Query() query: AdminTeachersQueryDto): Promise<Paginated<AdminTeacherDto>> {
    return this.teachers.list(query);
  }

  @Post('teachers')
  create(@Body() dto: CreateTeacherDto): Promise<AdminTeacherDto> {
    return this.teachers.create(dto);
  }

  @Patch('teachers/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeacherDto,
  ): Promise<AdminTeacherDto> {
    return this.teachers.update(id, dto);
  }

  @Patch('teachers/:id/status')
  setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeacherStatusDto,
  ): Promise<AdminTeacherDto> {
    return this.teachers.setStatus(id, dto);
  }
}
