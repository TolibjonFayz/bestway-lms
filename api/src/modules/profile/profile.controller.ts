import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UserRole } from '@/common/enums';
import { JwtPayload, Paginated } from '@/common/types';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { ProfileService } from './profile.service';
import { AchievementDto, ProfileDto } from './profile.types';

@Controller('profile')
@Roles(UserRole.Student)
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  get(@CurrentUser() user: JwtPayload): Promise<ProfileDto> {
    return this.profile.getProfile(user.sub);
  }

  @Get('achievements')
  achievements(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationDto,
  ): Promise<Paginated<AchievementDto>> {
    return this.profile.getAchievements(user.sub, query);
  }

  @Patch('notifications')
  updateNotifications(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateNotificationsDto,
  ): Promise<{ enabled: boolean }> {
    return this.profile.updateNotifications(user.sub, dto.enabled);
  }

  @Post('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.profile.changePassword(user.sub, dto.currentPassword, dto.newPassword);
  }
}
