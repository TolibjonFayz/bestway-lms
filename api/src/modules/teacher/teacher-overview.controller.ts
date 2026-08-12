import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload, Paginated } from '@/common/types';
import { TeacherOverviewService } from './teacher-overview.service';
import {
  TeacherStudentRowDto,
  TeacherTaskRowDto,
} from './teacher-overview.types';
import {
  TeacherStudentsQueryDto,
  TeacherTasksQueryDto,
} from './dto/teacher-overview.dto';

@Controller('teacher')
@Roles(UserRole.Teacher)
export class TeacherOverviewController {
  constructor(private readonly overview: TeacherOverviewService) {}

  /* Bounded by the teacher's own catalogue — a handful of units per course —
     so it ships whole rather than paged. */
  @Get('tasks')
  tasks(
    @CurrentUser() user: JwtPayload,
    @Query() query: TeacherTasksQueryDto,
  ): Promise<TeacherTaskRowDto[]> {
    return this.overview.tasks(user.sub, query);
  }

  @Get('students')
  students(
    @CurrentUser() user: JwtPayload,
    @Query() query: TeacherStudentsQueryDto,
  ): Promise<Paginated<TeacherStudentRowDto>> {
    return this.overview.students(user.sub, query);
  }
}
