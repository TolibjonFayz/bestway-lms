import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UserRole } from '@/common/enums';
import { Paginated } from '@/common/types';
import { AdminVocabService } from './admin-vocab.service';
import { CreateVocabWordDto } from './dto/create-vocab-word.dto';
import { ImportVocabCsvDto } from './dto/import-vocab-csv.dto';
import { AdminVocabWordDto } from './admin-content.types';

@Controller('admin')
@Roles(UserRole.Admin)
export class AdminVocabController {
  constructor(private readonly vocab: AdminVocabService) {}

  @Get('items/:itemId/vocab-words')
  list(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Query() page: PaginationDto,
  ): Promise<Paginated<AdminVocabWordDto>> {
    return this.vocab.list(itemId, page);
  }

  @Post('items/:itemId/vocab-words')
  create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateVocabWordDto,
  ): Promise<AdminVocabWordDto> {
    return this.vocab.create(itemId, dto);
  }

  @Post('items/:itemId/vocab-words/import')
  importCsv(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: ImportVocabCsvDto,
  ): Promise<{ created: number; skipped: number }> {
    return this.vocab.importCsv(itemId, dto.csv);
  }

  @Delete('vocab-words/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.vocab.delete(id);
  }
}
