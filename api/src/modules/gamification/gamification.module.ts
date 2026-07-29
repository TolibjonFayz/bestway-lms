import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CoinAward } from '@/database/models';
import { CoinsService } from './coins.service';

/* Coins live behind one service so every award goes through the same
   idempotency guarantee. */
@Module({
  imports: [SequelizeModule.forFeature([CoinAward])],
  providers: [CoinsService],
  exports: [CoinsService],
})
export class GamificationModule {}
