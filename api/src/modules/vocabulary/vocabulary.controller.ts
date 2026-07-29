import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload } from '@/common/types';
import { VocabAnswerDto } from './dto/vocab-answer.dto';
import { VocabularyService } from './vocabulary.service';
import { VocabAnswerResult, VocabSetDto } from './vocabulary.types';

@Controller('vocab')
@Roles(UserRole.Student)
export class VocabularyController {
  constructor(private readonly vocabulary: VocabularyService) {}

  @Get(':unitId/words')
  words(
    @CurrentUser() user: JwtPayload,
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<VocabSetDto> {
    return this.vocabulary.wordsForUnit(user.sub, unitId);
  }

  @Post('answer')
  @HttpCode(HttpStatus.OK)
  answer(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VocabAnswerDto,
  ): Promise<VocabAnswerResult> {
    return this.vocabulary.answer(user.sub, dto.vocabWordId, dto.correct);
  }
}
