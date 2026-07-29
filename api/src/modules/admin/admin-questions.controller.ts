import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UserRole } from '@/common/enums';
import { Paginated } from '@/common/types';
import { AdminQuestionsService } from './admin-questions.service';
import { SaveQuestionDto } from './dto/save-question.dto';
import { AdminQuestionDto } from './admin-content.types';

@Controller('admin')
@Roles(UserRole.Admin)
export class AdminQuestionsController {
  constructor(private readonly questions: AdminQuestionsService) {}

  @Get('items/:itemId/questions')
  list(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Query() page: PaginationDto,
  ): Promise<Paginated<AdminQuestionDto>> {
    return this.questions.list(itemId, page);
  }

  @Post('items/:itemId/questions')
  create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: SaveQuestionDto,
  ): Promise<AdminQuestionDto> {
    return this.questions.create(itemId, dto);
  }

  @Patch('questions/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveQuestionDto,
  ): Promise<AdminQuestionDto> {
    return this.questions.update(id, dto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.questions.delete(id);
  }
}
