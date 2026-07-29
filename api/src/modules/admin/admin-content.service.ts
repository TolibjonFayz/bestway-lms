import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { LessonItemType } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Paginated } from '@/common/types';
import {
  Course,
  LessonItem,
  Question,
  SpeakingTask,
  Test,
  Unit,
  Video,
  VocabWord,
} from '@/database/models';
import { LessonItemsService } from '../lessons/lesson-items.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonItemDto } from './dto/create-lesson-item.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateLessonItemDto } from './dto/update-lesson-item.dto';
import { AdminCourseDto, AdminLessonItemDto, AdminUnitDetailDto, AdminUnitDto } from './admin-content.types';

@Injectable()
export class AdminContentService {
  constructor(
    @InjectModel(Course) private readonly courses: typeof Course,
    @InjectModel(Unit) private readonly units: typeof Unit,
    @InjectModel(LessonItem) private readonly lessonItemsModel: typeof LessonItem,
    @InjectModel(Video) private readonly videos: typeof Video,
    @InjectModel(VocabWord) private readonly vocabWords: typeof VocabWord,
    @InjectModel(Test) private readonly tests: typeof Test,
    @InjectModel(Question) private readonly questions: typeof Question,
    @InjectModel(SpeakingTask) private readonly speakingTasks: typeof SpeakingTask,
    private readonly lessonItems: LessonItemsService,
  ) {}

  async listCourses(page: PaginationDto): Promise<Paginated<AdminCourseDto>> {
    const { rows, count } = await this.courses.findAndCountAll({
      where: { active: true },
      include: [{ model: Unit, as: 'units', attributes: ['id'] }],
      order: [['id', 'ASC']],
      offset: (page.page - 1) * page.limit,
      limit: page.limit,
    });
    return {
      items: rows.map((course) => ({
        id: course.id,
        name: course.name,
        subject: course.subject,
        description: course.description,
        unitCount: course.units?.length ?? 0,
      })),
      total: count,
      page: page.page,
      limit: page.limit,
    };
  }

  async createCourse(dto: CreateCourseDto): Promise<AdminCourseDto> {
    const course = await this.courses.create({
      name: dto.name,
      subject: dto.subject,
      description: dto.description ?? null,
      coverUrl: null,
      teacherId: null,
      active: true,
    } as Partial<Course> as Course);
    return { id: course.id, name: course.name, subject: course.subject, description: course.description, unitCount: 0 };
  }

  async listUnits(courseId: number, page: PaginationDto): Promise<Paginated<AdminUnitDto>> {
    await this.requireCourse(courseId);
    const { rows, count } = await this.units.findAndCountAll({
      where: { courseId },
      order: [['orderIndex', 'ASC']],
      offset: (page.page - 1) * page.limit,
      limit: page.limit,
    });
    return {
      items: rows.map((unit) => ({ id: unit.id, orderIndex: unit.orderIndex, title: unit.title })),
      total: count,
      page: page.page,
      limit: page.limit,
    };
  }

  async createUnit(courseId: number, dto: CreateUnitDto): Promise<AdminUnitDto> {
    await this.requireCourse(courseId);
    const maxOrder = await this.units.max<number, Unit>('orderIndex', { where: { courseId } });
    const unit = await this.units.create({
      courseId,
      orderIndex: (maxOrder ?? 0) + 1,
      title: dto.title,
      isLockedByDefault: true,
    } as Partial<Unit> as Unit);
    return { id: unit.id, orderIndex: unit.orderIndex, title: unit.title };
  }

  async reorderUnits(courseId: number, dto: ReorderDto): Promise<void> {
    await this.requireCourse(courseId);
    const owned = await this.units.findAll({ where: { courseId, id: { [Op.in]: dto.orderedIds } } });
    if (owned.length !== dto.orderedIds.length) {
      throw new BadRequestException('Roʻyxatdagi baʼzi unitlar bu kursga tegishli emas');
    }
    await Promise.all(
      dto.orderedIds.map((id, index) => this.units.update({ orderIndex: index + 1 }, { where: { id } })),
    );
  }

  async unitDetail(unitId: number): Promise<AdminUnitDetailDto> {
    const unit = await this.units.findByPk(unitId, {
      include: [
        { model: Course, as: 'course' },
        { model: LessonItem, as: 'items' },
      ],
      order: [[{ model: LessonItem, as: 'items' }, 'orderIndex', 'ASC']],
    });
    if (!unit?.course) throw new NotFoundException('Unit topilmadi');

    const items = await Promise.all(
      (unit.items ?? []).map((item) => this.toItemDto(item)),
    );

    return {
      id: unit.id,
      courseId: unit.courseId,
      subject: unit.course.subject,
      title: unit.title,
      items,
    };
  }

  async createLessonItem(unitId: number, dto: CreateLessonItemDto): Promise<AdminLessonItemDto> {
    const maxOrder = await this.lessonItemsModel.max<number, LessonItem>('orderIndex', { where: { unitId } });
    const item = await this.lessonItems.create({
      unitId,
      type: dto.type,
      orderIndex: (maxOrder ?? 0) + 1,
      title: dto.title,
    });

    switch (dto.type) {
      case LessonItemType.Video:
        await this.videos.create({
          lessonItemId: item.id,
          url: '',
          durationSeconds: 0,
          thumbnailUrl: null,
          konspekt: [],
        } as Partial<Video> as Video);
        break;
      case LessonItemType.Test:
        await this.tests.create({
          lessonItemId: item.id,
          passScore: 60,
          timeLimitSeconds: 900,
          attemptsAllowed: 2,
        } as Partial<Test> as Test);
        break;
      case LessonItemType.Speaking:
        await this.speakingTasks.create({
          lessonItemId: item.id,
          prompt: '',
          part: null,
          prepSeconds: null,
          maxDurationSeconds: 90,
        } as Partial<SpeakingTask> as SpeakingTask);
        break;
      case LessonItemType.Vocabulary:
        break;
    }

    return this.toItemDto(item);
  }

  async updateLessonItem(itemId: number, dto: UpdateLessonItemDto): Promise<AdminLessonItemDto> {
    const item = await this.lessonItemsModel.findByPk(itemId);
    if (!item) throw new NotFoundException('Dars elementi topilmadi');
    await item.update({ title: dto.title });
    return this.toItemDto(item);
  }

  async deleteLessonItem(itemId: number): Promise<void> {
    const item = await this.lessonItemsModel.findByPk(itemId);
    if (!item) throw new NotFoundException('Dars elementi topilmadi');
    await item.destroy();
  }

  async reorderItems(unitId: number, dto: ReorderDto): Promise<void> {
    const owned = await this.lessonItemsModel.findAll({
      where: { unitId, id: { [Op.in]: dto.orderedIds } },
    });
    if (owned.length !== dto.orderedIds.length) {
      throw new BadRequestException('Roʻyxatdagi baʼzi elementlar bu unitga tegishli emas');
    }
    await Promise.all(
      dto.orderedIds.map((id, index) =>
        this.lessonItemsModel.update({ orderIndex: index + 1 }, { where: { id } }),
      ),
    );
  }

  private async requireCourse(courseId: number): Promise<Course> {
    const course = await this.courses.findByPk(courseId);
    if (!course) throw new NotFoundException('Kurs topilmadi');
    return course;
  }

  private async toItemDto(item: LessonItem): Promise<AdminLessonItemDto> {
    const base = { id: item.id, orderIndex: item.orderIndex, type: item.type, title: item.title };

    if (item.type === LessonItemType.Video) {
      const video = await this.videos.findOne({ where: { lessonItemId: item.id } });
      return { ...base, videoDurationSeconds: video?.durationSeconds ?? 0, vocabWordCount: null, testQuestionCount: null };
    }
    if (item.type === LessonItemType.Vocabulary) {
      const count = await this.vocabWords.count({ where: { lessonItemId: item.id } });
      return { ...base, videoDurationSeconds: null, vocabWordCount: count, testQuestionCount: null };
    }
    if (item.type === LessonItemType.Test) {
      const test = await this.tests.findOne({ where: { lessonItemId: item.id } });
      const count = test ? await this.questions.count({ where: { testId: test.id } }) : 0;
      return { ...base, videoDurationSeconds: null, vocabWordCount: null, testQuestionCount: count };
    }
    return { ...base, videoDurationSeconds: null, vocabWordCount: null, testQuestionCount: null };
  }
}
