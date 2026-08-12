import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { CenterSettingsDto, CenterSettingsService } from './center-settings.service';
import { UpdateCenterSettingsDto } from './dto/center-settings.dto';

/* Public on purpose: the login screen paints itself in the centre's theme
   before anyone has signed in, and the payload carries nothing private. */
@Controller('settings')
export class PublicSettingsController {
  constructor(private readonly settings: CenterSettingsService) {}

  @Public()
  @Get()
  get(): Promise<CenterSettingsDto> {
    return this.settings.get();
  }
}

@Controller('admin/settings')
@Roles(UserRole.Admin)
export class AdminSettingsController {
  constructor(private readonly settings: CenterSettingsService) {}

  @Patch()
  update(@Body() dto: UpdateCenterSettingsDto): Promise<CenterSettingsDto> {
    return this.settings.update(dto);
  }
}
