import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { JwtPayload } from '@/common/types';
import { AuthService, AuthSession } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto, RefreshDto } from './dto/refresh.dto';
import { PublicUser } from '../users/user.serializer';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() request: Request): Promise<AuthSession> {
    return this.auth.login(dto.phone, dto.password, request.headers['user-agent']);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Body() dto: RefreshDto,
    @Req() request: Request,
  ): Promise<AuthSession> {
    return this.auth.refresh(dto.refreshToken, request.headers['user-agent']);
  }

  @Get('me')
  me(@CurrentUser() user: JwtPayload): Promise<PublicUser> {
    return this.auth.me(user.sub);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: JwtPayload,
    @Body() dto: LogoutDto,
  ): Promise<void> {
    await this.auth.logout(user.sub, dto.refreshToken);
  }
}
