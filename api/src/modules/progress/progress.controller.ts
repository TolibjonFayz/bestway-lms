import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload } from '@/common/types';
import { VideoProgressDto } from './dto/video-progress.dto';
import { ProgressService, VideoProgressResult } from './progress.service';

@Controller('progress')
@Roles(UserRole.Student)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Post('video')
  @HttpCode(HttpStatus.OK)
  video(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VideoProgressDto,
  ): Promise<VideoProgressResult> {
    return this.progress.reportVideo(
      user.sub,
      dto.lessonItemId,
      dto.percent,
      dto.completed ?? false,
    );
  }
}
