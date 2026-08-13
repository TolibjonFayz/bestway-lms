import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload } from '@/common/types';
import { TeacherGroupsService } from './teacher-groups.service';
import { TeacherGroupDetailDto, TeacherGroupSummaryDto } from './teacher-groups.types';

@Controller('teacher/groups')
@Roles(UserRole.Teacher)
export class TeacherGroupsController {
  constructor(private readonly groups: TeacherGroupsService) {}

  /* Unpaginated on purpose: a teacher has a handful of groups, and paging a
     list that short costs the caller a round trip for nothing. */
  @Get()
  list(@CurrentUser() user: JwtPayload): Promise<TeacherGroupSummaryDto[]> {
    return this.groups.listFor(user.sub);
  }

  @Get(':groupId')
  detail(
    @CurrentUser() user: JwtPayload,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<TeacherGroupDetailDto> {
    return this.groups.detail(user.sub, groupId);
  }

  /* Minted just-in-time — see ZoomService.getStartUrl on why this can't be
     precomputed or cached. */
  @Get(':groupId/zoom/start-url')
  zoomStartUrl(
    @CurrentUser() user: JwtPayload,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<{ url: string; isHost: boolean }> {
    return this.groups.zoomStartUrl(user.sub, groupId);
  }
}
