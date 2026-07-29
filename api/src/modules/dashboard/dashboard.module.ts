import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Announcement,
  Group,
  LessonItem,
  Progress,
  Submission,
  Unit,
} from '@/database/models';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { GamificationModule } from '../gamification/gamification.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Progress,
      Submission,
      Announcement,
      Unit,
      LessonItem,
      Group,
    ]),
    UsersModule,
    GamificationModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
