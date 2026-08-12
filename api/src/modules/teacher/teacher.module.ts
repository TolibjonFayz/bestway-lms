import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Attendance,
  Course,
  Group,
  LessonItem,
  Submission,
  Unit,
  User,
} from '@/database/models';
import { TestsModule } from '../tests/tests.module';
import { TeacherAttendanceController } from './teacher-attendance.controller';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { TeacherDashboardController } from './teacher-dashboard.controller';
import { TeacherDashboardService } from './teacher-dashboard.service';
import { TeacherGroupsController } from './teacher-groups.controller';
import { TeacherGroupsService } from './teacher-groups.service';
import { TeacherOverviewController } from './teacher-overview.controller';
import { TeacherOverviewService } from './teacher-overview.service';
import { TeacherScopeService } from './teacher-scope.service';
import { TeacherSubmissionsController } from './teacher-submissions.controller';
import { TeacherSubmissionsService } from './teacher-submissions.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Group, Submission, Attendance, LessonItem, Unit, Course]),
    TestsModule,
  ],
  controllers: [
    TeacherAttendanceController,
    TeacherDashboardController,
    TeacherGroupsController,
    TeacherOverviewController,
    TeacherSubmissionsController,
  ],
  providers: [
    TeacherScopeService,
    TeacherAttendanceService,
    TeacherDashboardService,
    TeacherGroupsService,
    TeacherOverviewService,
    TeacherSubmissionsService,
  ],
})
export class TeacherModule {}
