import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload } from '@/common/types';
import { PracticeService } from './practice.service';
import {
  PracticeMistakeDto,
  PracticeSummaryDto,
  PracticeWordDto,
} from './practice.types';
import { PracticeMistakeAnswerDto, PracticeWordAnswerDto } from './dto/practice.dto';

@Controller('practice')
@Roles(UserRole.Student)
export class PracticeController {
  constructor(private readonly practice: PracticeService) {}

  @Get('summary')
  summary(@CurrentUser() user: JwtPayload): Promise<PracticeSummaryDto> {
    return this.practice.summary(user.sub);
  }

  /* Both sessions are capped server-side, so neither needs paging. */
  @Get('vocab')
  vocab(@CurrentUser() user: JwtPayload): Promise<PracticeWordDto[]> {
    return this.practice.vocabSession(user.sub);
  }

  @Post('vocab/answer')
  answerWord(@CurrentUser() user: JwtPayload, @Body() dto: PracticeWordAnswerDto) {
    return this.practice.answerWord(user.sub, dto.vocabWordId, dto.correct);
  }

  @Get('mistakes')
  mistakes(@CurrentUser() user: JwtPayload): Promise<PracticeMistakeDto[]> {
    return this.practice.mistakeSession(user.sub);
  }

  @Post('mistakes/check')
  checkMistake(@CurrentUser() user: JwtPayload, @Body() dto: PracticeMistakeAnswerDto) {
    return this.practice.checkMistake(user.sub, dto.questionId, dto.answer);
  }
}
