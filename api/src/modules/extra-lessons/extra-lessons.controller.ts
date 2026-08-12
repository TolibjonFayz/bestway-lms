import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload } from '@/common/types';
import { ExtraLessonsService } from './extra-lessons.service';
import {
  ExtraLessonRequestDto,
  TeacherExtraLessonRequestDto,
} from './extra-lessons.types';
import {
  AnswerExtraLessonRequestDto,
  CreateExtraLessonRequestDto,
} from './dto/extra-lesson.dto';

@Controller('extra-lessons')
@Roles(UserRole.Student)
export class ExtraLessonsController {
  constructor(private readonly extraLessons: ExtraLessonsService) {}

  /* A student's own history is short — capped by OPEN_REQUEST_LIMIT on the
     open end — so it ships whole. */
  @Get()
  list(@CurrentUser() user: JwtPayload): Promise<ExtraLessonRequestDto[]> {
    return this.extraLessons.listForStudent(user.sub);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateExtraLessonRequestDto,
  ): Promise<ExtraLessonRequestDto> {
    return this.extraLessons.create(user.sub, dto);
  }
}

@Controller('teacher/extra-lessons')
@Roles(UserRole.Teacher)
export class TeacherExtraLessonsController {
  constructor(private readonly extraLessons: ExtraLessonsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload): Promise<TeacherExtraLessonRequestDto[]> {
    return this.extraLessons.listForTeacher(user.sub);
  }

  @Patch(':id')
  answer(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AnswerExtraLessonRequestDto,
  ): Promise<TeacherExtraLessonRequestDto> {
    return this.extraLessons.answer(user.sub, id, dto);
  }
}
