import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  LessonItem,
  Progress,
  VocabWord,
  VocabWordProgress,
} from '@/database/models';
import { GamificationModule } from '../gamification/gamification.module';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      LessonItem,
      VocabWord,
      VocabWordProgress,
      Progress,
    ]),
    GamificationModule,
  ],
  controllers: [VocabularyController],
  providers: [VocabularyService],
})
export class VocabularyModule {}
