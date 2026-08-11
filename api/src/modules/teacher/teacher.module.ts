import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Attendance,
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
import { TeacherScopeService } from './teacher-scope.service';
import { TeacherSubmissionsController } from './teacher-submissions.controller';
import { TeacherSubmissionsService } from './teacher-submissions.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Group, Submission, Attendance, LessonItem, Unit]),
    TestsModule,
  ],
  controllers: [
    TeacherAttendanceController,
    TeacherDashboardController,
    TeacherGroupsController,
    TeacherSubmissionsController,
  ],
  providers: [
    TeacherScopeService,
    TeacherAttendanceService,
    TeacherDashboardService,
    TeacherGroupsService,
    TeacherSubmissionsService,
  ],
})
export class TeacherModule {}
