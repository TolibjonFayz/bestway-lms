import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CourseSubject,
  ITEM_TYPES_BY_SUBJECT,
  isItemTypeAllowed,
  LessonItemType,
} from '@/common/enums';
import { Course, LessonItem, Unit } from '@/database/models';

export interface CreateLessonItemInput {
  unitId: number;
  type: LessonItemType;
  orderIndex: number;
  title: string;
}

/* A unit's legal item types follow from its course's subject: maths and
   science have no vocabulary and no speaking. The database cannot express that
   rule across units → courses, so every write path goes through here. */
@Injectable()
export class LessonItemsService {
  constructor(
    @InjectModel(LessonItem) private readonly lessonItems: typeof LessonItem,
    @InjectModel(Unit) private readonly units: typeof Unit,
  ) {}

  /** The subject that governs a unit, resolved through its course. */
  async subjectForUnit(unitId: number): Promise<CourseSubject> {
    const unit = await this.units.findByPk(unitId, {
      include: [{ model: Course, as: 'course', attributes: ['subject'] }],
    });
    if (!unit?.course) {
      throw new NotFoundException(`Unit ${unitId} topilmadi`);
    }
    return unit.course.subject;
  }

  allowedTypes(subject: CourseSubject): readonly LessonItemType[] {
    return ITEM_TYPES_BY_SUBJECT[subject];
  }

  /** Throws unless `type` is legal for the unit's subject. */
  async assertTypeAllowed(unitId: number, type: LessonItemType): Promise<void> {
    const subject = await this.subjectForUnit(unitId);
    if (isItemTypeAllowed(subject, type)) return;

    throw new BadRequestException(
      `"${subject}" fanidagi unitda "${type}" turidagi element boʻlishi mumkin emas. ` +
        `Ruxsat etilgan turlar: ${this.allowedTypes(subject).join(', ')}.`,
    );
  }

  async create(input: CreateLessonItemInput): Promise<LessonItem> {
    await this.assertTypeAllowed(input.unitId, input.type);
    return this.lessonItems.create(input as Partial<LessonItem> as LessonItem);
  }
}
