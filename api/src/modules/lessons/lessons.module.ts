import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Course,
  Enrollment,
  LessonItem,
  Progress,
  Question,
  Submission,
  Test,
  Unit,
  VocabWord,
} from '@/database/models';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { LessonItemsService } from './lesson-items.service';

/* LessonItemsService stays exported so the seed and any future write path
   creates items through the one place the subject/type rule is enforced. */
@Module({
  imports: [
    SequelizeModule.forFeature([
      LessonItem,
      Unit,
      Course,
      Enrollment,
      Progress,
      Submission,
      VocabWord,
      Test,
      Question,
    ]),
  ],
  controllers: [CoursesController],
  providers: [LessonItemsService, CoursesService],
  exports: [LessonItemsService],
})
export class LessonsModule {}
