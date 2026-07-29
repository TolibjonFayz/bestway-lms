import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Enrollment,
  LessonItem,
  Progress,
  Submission,
  User,
  VocabWordProgress,
} from '@/database/models';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Progress, Submission, VocabWordProgress, Enrollment, LessonItem]),
    UsersModule,
    AuthModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
