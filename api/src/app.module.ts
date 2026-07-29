import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { MarksModule } from './modules/marks/marks.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProgressModule } from './modules/progress/progress.module';
import { RatingModule } from './modules/rating/rating.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { TestsModule } from './modules/tests/tests.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], cache: true }),
    DatabaseModule,
    AdminModule,
    AuthModule,
    UsersModule,
    LessonsModule,
    DashboardModule,
    GamificationModule,
    MarksModule,
    ProfileModule,
    ProgressModule,
    RatingModule,
    TeacherModule,
    TestsModule,
    VocabularyModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    /* Routes fail closed — anything reachable without a token says @Public().
       Order matters: authenticate first, then check the role. */
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
