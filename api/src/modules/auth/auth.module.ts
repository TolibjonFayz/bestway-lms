import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { RefreshToken } from '@/database/models';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

/* No global JwtModule secret: access and refresh tokens are signed and
   verified with different secrets, passed explicitly at every call site. */
@Module({
  imports: [SequelizeModule.forFeature([RefreshToken]), UsersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
