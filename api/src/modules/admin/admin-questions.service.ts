import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LessonItemType, QuestionType } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Paginated } from '@/common/types';
import { LessonItem, Question, QuestionOption, Test } from '@/database/models';
import { SaveQuestionDto } from './dto/save-question.dto';
import { AdminQuestionDto } from './admin-content.types';

@Injectable()
export class AdminQuestionsService {
  constructor(
    @InjectModel(LessonItem) private readonly lessonItems: typeof LessonItem,
    @InjectModel(Test) private readonly tests: typeof Test,
    @InjectModel(Question) private readonly questions: typeof Question,
    @InjectModel(QuestionOption) private readonly options: typeof QuestionOption,
  ) {}

  async list(lessonItemId: number, page: PaginationDto): Promise<Paginated<AdminQuestionDto>> {
    const test = await this.requireTest(lessonItemId);
    const { rows, count } = await this.questions.findAndCountAll({
      where: { testId: test.id },
      include: [{ model: QuestionOption, as: 'options' }],
      order: [
        ['orderIndex', 'ASC'],
        [{ model: QuestionOption, as: 'options' }, 'orderIndex', 'ASC'],
      ],
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

  async create(lessonItemId: number, dto: SaveQuestionDto): Promise<AdminQuestionDto> {
    this.assertExactlyOneCorrect(dto);
    const test = await this.requireTest(lessonItemId);
    const maxOrder = await this.questions.max<number, Question>('orderIndex', { where: { testId: test.id } });

    const question = await this.questions.create({
      testId: test.id,
      type: QuestionType.MultipleChoice,
      orderIndex: (maxOrder ?? 0) + 1,
      prompt: dto.prompt,
      explanation: null,
      points: 1,
    } as Partial<Question> as Question);

    await this.writeOptions(question.id, dto);
    return this.toDto(await this.reload(question.id));
  }

  async update(questionId: number, dto: SaveQuestionDto): Promise<AdminQuestionDto> {
    this.assertExactlyOneCorrect(dto);
    const question = await this.questions.findByPk(questionId);
    if (!question) throw new NotFoundException('Savol topilmadi');
    if (question.type !== QuestionType.MultipleChoice) {
      throw new BadRequestException(
        'Bu savol turini bu muharrirda tahrirlab boʻlmaydi — faqat bitta toʻgʻri javobli savollar tahrirlanadi',
      );
    }

    await question.update({ prompt: dto.prompt });
    await this.options.destroy({ where: { questionId } });
    await this.writeOptions(questionId, dto);
    return this.toDto(await this.reload(questionId));
  }

  async delete(questionId: number): Promise<void> {
    const question = await this.questions.findByPk(questionId);
    if (!question) throw new NotFoundException('Savol topilmadi');
    await question.destroy();
  }

  private assertExactlyOneCorrect(dto: SaveQuestionDto): void {
    const correctCount = dto.options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) {
      throw new BadRequestException('Aynan bitta variant toʻgʻri deb belgilanishi kerak');
    }
  }

  private writeOptions(questionId: number, dto: SaveQuestionDto): Promise<QuestionOption[]> {
    return this.options.bulkCreate(
      dto.options.map((option, index) => ({
        questionId,
        orderIndex: index + 1,
        text: option.text,
        isCorrect: option.isCorrect,
        matchText: null,
      })) as unknown as QuestionOption[],
    );
  }

  private async requireTest(lessonItemId: number): Promise<Test> {
    const item = await this.lessonItems.findByPk(lessonItemId);
    if (!item || item.type !== LessonItemType.Test) {
      throw new NotFoundException('Test elementi topilmadi');
    }
    const test = await this.tests.findOne({ where: { lessonItemId } });
    if (!test) throw new NotFoundException('Test topilmadi');
    return test;
  }

  private async reload(questionId: number): Promise<Question> {
    const question = await this.questions.findByPk(questionId, {
      include: [{ model: QuestionOption, as: 'options' }],
      order: [[{ model: QuestionOption, as: 'options' }, 'orderIndex', 'ASC']],
    });
    if (!question) throw new NotFoundException('Savol topilmadi');
    return question;
  }

  private toDto(question: Question): AdminQuestionDto {
    return {
      id: question.id,
      orderIndex: question.orderIndex,
      type: question.type,
      prompt: question.prompt,
      options: (question.options ?? [])
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((option) => ({ id: option.id, text: option.text, isCorrect: option.isCorrect })),
      editable: question.type === QuestionType.MultipleChoice,
    };
  }
}
