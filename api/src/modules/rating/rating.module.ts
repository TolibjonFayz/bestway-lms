import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Group, User } from '@/database/models';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';

@Module({
  imports: [SequelizeModule.forFeature([User, Group])],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
