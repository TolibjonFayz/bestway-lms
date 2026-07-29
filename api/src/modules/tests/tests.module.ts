import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  LessonItem,
  Progress,
  Question,
  QuestionOption,
  Submission,
  Test,
  Unit,
} from '@/database/models';
import { GamificationModule } from '../gamification/gamification.module';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      LessonItem,
      Unit,
      Test,
      Question,
      QuestionOption,
      Submission,
      Progress,
    ]),
    GamificationModule,
  ],
  controllers: [TestsController],
  providers: [TestsService],
  /* The teacher module calls finalizeManualGrade() once a test that waited
     on an open question finally gets its score, so the "test just finished"
     side-effects (progress, coins) stay in one place. */
  exports: [TestsService],
})
export class TestsModule {}
