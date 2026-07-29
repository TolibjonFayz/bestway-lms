import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LessonItem, Progress } from '@/database/models';
import { GamificationModule } from '../gamification/gamification.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [SequelizeModule.forFeature([Progress, LessonItem]), GamificationModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
