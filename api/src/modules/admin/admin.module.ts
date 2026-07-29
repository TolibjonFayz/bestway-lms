import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Course,
  Group,
  LessonItem,
  Question,
  QuestionOption,
  SpeakingTask,
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
import { AdminQuestionsController } from './admin-questions.controller';
import { AdminQuestionsService } from './admin-questions.service';
import { AdminStudentsController } from './admin-students.controller';
import { AdminStudentsService } from './admin-students.service';
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
    ]),
    LessonsModule,
    UsersModule,
  ],
  controllers: [
    AdminContentController,
    AdminVocabController,
    AdminQuestionsController,
    AdminStudentsController,
  ],
  providers: [AdminContentService, AdminVocabService, AdminQuestionsService, AdminStudentsService],
})
export class AdminModule {}
