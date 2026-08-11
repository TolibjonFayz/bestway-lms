import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload } from '@/common/types';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { AttendanceRegisterDto } from './teacher-attendance.types';
import {
  AttendanceRegisterQueryDto,
  ClearAttendanceDto,
  MarkAttendanceDto,
  MarkDayDto,
} from './dto/attendance-register.dto';

@Controller('teacher/attendance')
@Roles(UserRole.Teacher)
export class TeacherAttendanceController {
  constructor(private readonly attendance: TeacherAttendanceService) {}

  /* One month of one group is a bounded grid — 31 days by at most a dozen
     students — so it ships whole rather than paged. */
  @Get()
  register(
    @CurrentUser() user: JwtPayload,
    @Query() query: AttendanceRegisterQueryDto,
  ): Promise<AttendanceRegisterDto> {
    return this.attendance.register(user.sub, query.groupId, query.month);
  }

  @Put('cell')
  @HttpCode(HttpStatus.NO_CONTENT)
  markOne(@CurrentUser() user: JwtPayload, @Body() dto: MarkAttendanceDto): Promise<void> {
    return this.attendance.markOne(user.sub, dto);
  }

  @Delete('cell')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearOne(
    @CurrentUser() user: JwtPayload,
    @Query() query: ClearAttendanceDto,
  ): Promise<void> {
    return this.attendance.clearOne(user.sub, query);
  }

  @Put('day')
  @HttpCode(HttpStatus.NO_CONTENT)
  markDay(@CurrentUser() user: JwtPayload, @Body() dto: MarkDayDto): Promise<void> {
    return this.attendance.markDay(user.sub, dto);
  }
}
