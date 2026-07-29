import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload } from '@/common/types';
import { TeacherDashboardService } from './teacher-dashboard.service';
import { TeacherDashboardDto } from './teacher-dashboard.types';

@Controller('teacher/dashboard')
@Roles(UserRole.Teacher)
export class TeacherDashboardController {
  constructor(private readonly dashboard: TeacherDashboardService) {}

  @Get()
  get(@CurrentUser() user: JwtPayload): Promise<TeacherDashboardDto> {
    return this.dashboard.forTeacher(user.sub);
  }
}
