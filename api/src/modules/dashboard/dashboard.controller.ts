import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload } from '@/common/types';
import { DashboardService } from './dashboard.service';
import { DashboardDto } from './dashboard.types';

@Controller('dashboard')
@Roles(UserRole.Student)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  /* One request for the whole screen. The student id comes from the verified
     token, never from a query parameter. */
  @Get()
  get(@CurrentUser() user: JwtPayload): Promise<DashboardDto> {
    return this.dashboard.forStudent(user.sub);
  }
}
