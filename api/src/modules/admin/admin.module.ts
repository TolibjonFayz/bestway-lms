import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Attendance,
  Course,
  Group,
  LessonItem,
  Question,
  QuestionOption,
  SpeakingTask,
  Submission,
  Test,
  Unit,
  User,
  Video,
  VocabWord,
} from '@/database/models';
import { LessonsModule } from '../lessons/lessons.module';
import { UsersModule } from '../users/users.module';
import { AdminContentController } from './admin-content.controller';
import { AdminContentService } from './admin-content.service';
import { AdminOverviewService } from './admin-overview.service';
import { AdminQuestionsController } from './admin-questions.controller';
import { AdminQuestionsService } from './admin-questions.service';
import { AdminStudentsController } from './admin-students.controller';
import { AdminStudentsService } from './admin-students.service';
import { AdminTeachersController } from './admin-teachers.controller';
import { AdminTeachersService } from './admin-teachers.service';
import { AdminVocabController } from './admin-vocab.controller';
import { AdminVocabService } from './admin-vocab.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Course,
      Unit,
      LessonItem,
      Video,
      VocabWord,
      Test,
      Question,
      QuestionOption,
      SpeakingTask,
      User,
      Group,
      Submission,
      Attendance,
    ]),
    LessonsModule,
    UsersModule,
  ],
  controllers: [
    AdminContentController,
    AdminVocabController,
    AdminQuestionsController,
    AdminStudentsController,
    AdminTeachersController,
  ],
  providers: [
    AdminContentService,
    AdminVocabService,
    AdminQuestionsService,
    AdminStudentsService,
    AdminTeachersService,
    AdminOverviewService,
  ],
})
export class AdminModule {}
