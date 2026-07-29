import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Attendance, LessonItem, Submission, Unit, User } from '@/database/models';
import { MarksController } from './marks.controller';
import { MarksService } from './marks.service';

@Module({
  imports: [SequelizeModule.forFeature([Submission, Attendance, LessonItem, Unit, User])],
  controllers: [MarksController],
  providers: [MarksService],
})
export class MarksModule {}
