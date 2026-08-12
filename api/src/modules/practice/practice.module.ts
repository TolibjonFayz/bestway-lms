import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  LessonItem,
  Question,
  QuestionOption,
  Unit,
  VocabWord,
  VocabWordProgress,
} from '@/database/models';
import { TestsModule } from '../tests/tests.module';
import { VocabularyModule } from '../vocabulary/vocabulary.module';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VocabWord,
      VocabWordProgress,
      LessonItem,
      Unit,
      Question,
      QuestionOption,
    ]),
    VocabularyModule,
    TestsModule,
  ],
  controllers: [PracticeController],
  providers: [PracticeService],
})
export class PracticeModule {}
