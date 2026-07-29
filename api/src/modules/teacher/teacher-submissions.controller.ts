import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { Paginated } from '@/common/types';
import { JwtPayload } from '@/common/types';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { TeacherSubmissionsQueryDto } from './dto/teacher-submissions-query.dto';
import { TeacherSubmissionsService } from './teacher-submissions.service';
import {
  GradeSubmissionResultDto,
  SubmissionDetailDto,
  SubmissionListItemDto,
} from './teacher-submissions.types';

@Controller('teacher/submissions')
@Roles(UserRole.Teacher)
export class TeacherSubmissionsController {
  constructor(private readonly submissions: TeacherSubmissionsService) {}

  @Get()
  list(
    @CurrentUser() user: JwtPayload,
    @Query() query: TeacherSubmissionsQueryDto,
  ): Promise<Paginated<SubmissionListItemDto>> {
    return this.submissions.list(user.sub, query);
  }

  @Get(':id')
  detail(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SubmissionDetailDto> {
    return this.submissions.detail(user.sub, id);
  }

  @Post(':id/grade')
  grade(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GradeSubmissionDto,
  ): Promise<GradeSubmissionResultDto> {
    return this.submissions.grade(user.sub, id, dto.score, dto.comment);
  }
}
