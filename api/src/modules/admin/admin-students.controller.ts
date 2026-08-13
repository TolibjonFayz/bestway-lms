import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { Paginated } from '@/common/types';
import { AdminStudentsService } from './admin-students.service';
import { AdminStudentsQueryDto } from './dto/admin-students-query.dto';
import { BulkStudentStatusDto } from './dto/bulk-student-status.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateGroupZoomDto } from './dto/group-zoom.dto';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto';
import { AdminGroupDto, AdminStudentDto } from './admin-people.types';

@Controller('admin')
@Roles(UserRole.Admin)
export class AdminStudentsController {
  constructor(private readonly students: AdminStudentsService) {}

  @Get('students')
  list(@Query() query: AdminStudentsQueryDto): Promise<Paginated<AdminStudentDto>> {
    return this.students.list(query);
  }

  @Post('students')
  create(@Body() dto: CreateStudentDto): Promise<AdminStudentDto> {
    return this.students.create(dto);
  }

  @Patch('students/:id/status')
  setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentStatusDto,
  ): Promise<AdminStudentDto> {
    return this.students.setStatus(id, dto.active);
  }

  @Patch('students/bulk-status')
  bulkSetStatus(@Body() dto: BulkStudentStatusDto): Promise<{ updated: number }> {
    return this.students.bulkSetStatus(dto.ids, dto.active);
  }

  @Get('groups')
  listGroups(): Promise<AdminGroupDto[]> {
    return this.students.listGroups();
  }

  @Patch('groups/:id/zoom')
  setGroupZoom(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGroupZoomDto,
  ): Promise<AdminGroupDto> {
    return this.students.setGroupZoomUrl(id, dto.zoomJoinUrl);
  }
}
