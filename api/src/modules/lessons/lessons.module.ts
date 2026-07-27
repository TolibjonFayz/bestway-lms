import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Course, LessonItem, Unit } from '@/database/models';
import { LessonItemsService } from './lesson-items.service';

/* Service-only for now: no screens read lesson items yet, but the seed and any
   future controller must create them through LessonItemsService so the
   subject/type rule is enforced in exactly one place. */
@Module({
  imports: [SequelizeModule.forFeature([LessonItem, Unit, Course])],
  providers: [LessonItemsService],
  exports: [LessonItemsService],
})
export class LessonsModule {}
