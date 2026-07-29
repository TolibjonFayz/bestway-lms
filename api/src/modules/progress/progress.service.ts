import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LessonItemType } from '@/common/enums';
import { CoinReason, LessonItem, Progress } from '@/database/models';
import { CoinsService } from '../gamification/coins.service';

/** A video counts as finished once this much of it has been watched. */
export const VIDEO_COMPLETION_THRESHOLD = 90;

export interface VideoProgressResult {
  lessonItemId: number;
  percent: number;
  completed: boolean;
  /** Whether "Darsni yakunlash" may be pressed — decided here, not in the UI. */
  canComplete: boolean;
  coinsAwarded: number;
  coinsAlreadyHeld: boolean;
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress) private readonly progress: typeof Progress,
    @InjectModel(LessonItem) private readonly lessonItems: typeof LessonItem,
    private readonly coins: CoinsService,
  ) {}

  async reportVideo(
    studentId: number,
    lessonItemId: number,
    percent: number,
    completing = false,
  ): Promise<VideoProgressResult> {
    const item = await this.lessonItems.findByPk(lessonItemId);
    if (!item) throw new NotFoundException('Dars elementi topilmadi');
    if (item.type !== LessonItemType.Video) {
      throw new BadRequestException('Bu element video dars emas');
    }

    const existing = await this.progress.findOne({
      where: { studentId, lessonItemId },
    });

    /* Watched percentage only ever climbs. Rewinding to rewatch a section must
       not undo progress the student already earned. */
    const watched = Math.max(existing?.percent ?? 0, percent);
    const alreadyDone = existing?.percent === 100;
    const canComplete = watched >= VIDEO_COMPLETION_THRESHOLD;

    if (completing && !canComplete && !alreadyDone) {
      /* The client asked to finish a video the server has not seen enough of.
         Never take the client's word for how much was watched. */
      throw new BadRequestException(
        `Darsni yakunlash uchun kamida ${VIDEO_COMPLETION_THRESHOLD}% koʻrish kerak`,
      );
    }

    const finished = alreadyDone || (completing && canComplete);
    const nextPercent = finished ? 100 : watched;

    if (existing) {
      await existing.update({
        percent: nextPercent,
        completedAt: finished ? (existing.completedAt ?? new Date()) : null,
      });
    } else {
      await this.progress.create({
        studentId,
        lessonItemId,
        percent: nextPercent,
        completedAt: finished ? new Date() : null,
      } as Partial<Progress> as Progress);
    }

    let coinsAwarded = 0;
    let coinsAlreadyHeld = false;
    if (finished) {
      const result = await this.coins.award(
        studentId,
        lessonItemId,
        CoinReason.VideoCompleted,
      );
      coinsAwarded = result.awarded;
      coinsAlreadyHeld = !result.isNew;
    }

    return {
      lessonItemId,
      percent: nextPercent,
      completed: finished,
      canComplete: canComplete || finished,
      coinsAwarded,
      coinsAlreadyHeld,
    };
  }
}
