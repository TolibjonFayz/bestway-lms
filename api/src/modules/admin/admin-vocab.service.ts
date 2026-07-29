import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LessonItemType } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Paginated } from '@/common/types';
import { LessonItem, VocabWord } from '@/database/models';
import { CreateVocabWordDto } from './dto/create-vocab-word.dto';
import { AdminVocabWordDto } from './admin-content.types';

@Injectable()
export class AdminVocabService {
  constructor(
    @InjectModel(LessonItem) private readonly lessonItems: typeof LessonItem,
    @InjectModel(VocabWord) private readonly vocabWords: typeof VocabWord,
  ) {}

  async list(lessonItemId: number, page: PaginationDto): Promise<Paginated<AdminVocabWordDto>> {
    await this.requireVocabItem(lessonItemId);
    const { rows, count } = await this.vocabWords.findAndCountAll({
      where: { lessonItemId },
      order: [['orderIndex', 'ASC']],
      offset: (page.page - 1) * page.limit,
      limit: page.limit,
    });
    return {
      items: rows.map((row) => this.toDto(row)),
      total: count,
      page: page.page,
      limit: page.limit,
    };
  }

  async create(lessonItemId: number, dto: CreateVocabWordDto): Promise<AdminVocabWordDto> {
    await this.requireVocabItem(lessonItemId);
    const maxOrder = await this.vocabWords.max<number, VocabWord>('orderIndex', { where: { lessonItemId } });
    const row = await this.vocabWords.create({
      lessonItemId,
      wordEn: dto.wordEn.trim(),
      wordUz: dto.wordUz.trim(),
      transcription: dto.transcription?.trim() || null,
      exampleEn: dto.exampleEn?.trim() || null,
      orderIndex: (maxOrder ?? 0) + 1,
    } as Partial<VocabWord> as VocabWord);
    return this.toDto(row);
  }

  async delete(id: number): Promise<void> {
    const row = await this.vocabWords.findByPk(id);
    if (!row) throw new NotFoundException('Soʻz topilmadi');
    await row.destroy();
  }

  /* Accepts "english,uzbek[,transcription[,example]]" per line, with or
     without a header row — a first line that doesn't look like data (its
     English cell contains a non-letter) is treated as a header and skipped. */
  async importCsv(
    lessonItemId: number,
    csv: string,
  ): Promise<{ created: number; skipped: number }> {
    await this.requireVocabItem(lessonItemId);

    const lines = csv
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (!lines.length) throw new BadRequestException('CSV boʻsh');

    const startIndex = /^[a-zA-Z]/.test(lines[0].split(',')[0]?.trim() ?? '') ? 0 : 1;
    const maxOrder = (await this.vocabWords.max<number, VocabWord>('orderIndex', { where: { lessonItemId } })) ?? 0;

    let created = 0;
    let skipped = 0;
    const rows: Partial<VocabWord>[] = [];

    for (let i = startIndex; i < lines.length; i += 1) {
      const cells = lines[i].split(',').map((cell) => cell.trim());
      const [wordEn, wordUz, transcription, exampleEn] = cells;
      if (!wordEn || !wordUz) {
        skipped += 1;
        continue;
      }
      rows.push({
        lessonItemId,
        wordEn,
        wordUz,
        transcription: transcription || null,
        exampleEn: exampleEn || null,
        orderIndex: maxOrder + created + 1,
      } as Partial<VocabWord>);
      created += 1;
    }

    if (rows.length) {
      await this.vocabWords.bulkCreate(rows as unknown as VocabWord[]);
    }
    return { created, skipped };
  }

  private async requireVocabItem(lessonItemId: number): Promise<LessonItem> {
    const item = await this.lessonItems.findByPk(lessonItemId);
    if (!item || item.type !== LessonItemType.Vocabulary) {
      throw new NotFoundException('Vocabulary elementi topilmadi');
    }
    return item;
  }

  private toDto(row: VocabWord): AdminVocabWordDto {
    return {
      id: row.id,
      orderIndex: row.orderIndex,
      wordEn: row.wordEn,
      wordUz: row.wordUz,
      transcription: row.transcription,
      exampleEn: row.exampleEn,
    };
  }
}
