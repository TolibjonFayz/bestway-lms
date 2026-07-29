import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload } from '@/common/types';
import { TestAnswersDto } from './dto/test-answers.dto';
import { TestsService } from './tests.service';
import { TestAttemptDto, TestResultDto, TestStateDto } from './tests.types';

@Controller('tests')
@Roles(UserRole.Student)
export class TestsController {
  constructor(private readonly tests: TestsService) {}

  @Get(':lessonItemId')
  state(
    @CurrentUser() user: JwtPayload,
    @Param('lessonItemId', ParseIntPipe) lessonItemId: number,
  ): Promise<TestStateDto> {
    return this.tests.getState(user.sub, lessonItemId);
  }

  @Put(':lessonItemId/answers')
  @HttpCode(HttpStatus.OK)
  saveAnswers(
    @CurrentUser() user: JwtPayload,
    @Param('lessonItemId', ParseIntPipe) lessonItemId: number,
    @Body() dto: TestAnswersDto,
  ): Promise<{ savedAt: string }> {
    return this.tests.saveAnswers(user.sub, lessonItemId, dto.answers);
  }

  @Post(':lessonItemId/submit')
  @HttpCode(HttpStatus.OK)
  submit(
    @CurrentUser() user: JwtPayload,
    @Param('lessonItemId', ParseIntPipe) lessonItemId: number,
    @Body() dto: TestAnswersDto,
  ): Promise<TestResultDto> {
    return this.tests.submit(user.sub, lessonItemId, dto.answers);
  }

  @Post(':lessonItemId/retake')
  @HttpCode(HttpStatus.OK)
  retake(
    @CurrentUser() user: JwtPayload,
    @Param('lessonItemId', ParseIntPipe) lessonItemId: number,
  ): Promise<TestAttemptDto> {
    return this.tests.retake(user.sub, lessonItemId);
  }
}
