import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExtraLessonRequest, Group, Unit, User } from '@/database/models';
import { TeacherScopeService } from '../teacher/teacher-scope.service';
import {
  ExtraLessonsController,
  TeacherExtraLessonsController,
} from './extra-lessons.controller';
import { ExtraLessonsService } from './extra-lessons.service';

@Module({
  imports: [SequelizeModule.forFeature([ExtraLessonRequest, Unit, User, Group])],
  controllers: [ExtraLessonsController, TeacherExtraLessonsController],
  /* TeacherScopeService is provided rather than imported: it is a thin,
     stateless query helper and the teacher module does not export it. */
  providers: [ExtraLessonsService, TeacherScopeService],
})
export class ExtraLessonsModule {}
