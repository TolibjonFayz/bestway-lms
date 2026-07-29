import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { CoinAward, CoinReason } from '@/database/models';

/** What each completion is worth. Whole coins, never a float. */
export const COIN_VALUES: Readonly<Record<CoinReason, number>> = Object.freeze({
  [CoinReason.VideoCompleted]: 10,
  [CoinReason.VocabularyCompleted]: 25,
  [CoinReason.TestCompleted]: 20,
});

export interface AwardResult {
  /** Coins granted by this call — 0 when the award already existed. */
  awarded: number;
  /** True only the first time; the UI shows the coin banner on this. */
  isNew: boolean;
  /** Everything this student has ever earned for this item and reason. */
  total: number;
}

@Injectable()
export class CoinsService {
  private readonly logger = new Logger(CoinsService.name);

  constructor(
    @InjectModel(CoinAward) private readonly awards: typeof CoinAward,
  ) {}

  /* Idempotent by construction: the insert races against a unique index on
     (student, item, reason), so a double-click or a retried request cannot pay
     twice even if both requests pass the existence check together. */
  async award(
    studentId: number,
    lessonItemId: number,
    reason: CoinReason,
  ): Promise<AwardResult> {
    const amount = COIN_VALUES[reason];

    try {
      await this.awards.create({
        studentId,
        lessonItemId,
        reason,
        amount,
        awardedAt: new Date(),
      } as Partial<CoinAward> as CoinAward);

      return { awarded: amount, isNew: true, total: amount };
    } catch (error) {
      if (!(error instanceof UniqueConstraintError)) throw error;

      /* Already paid — report the original amount so the client can still
         show what this item was worth, but grant nothing. */
      const existing = await this.awards.findOne({
        where: { studentId, lessonItemId, reason },
      });
      this.logger.debug(
        `Coin award already held: student ${studentId}, item ${lessonItemId}, ${reason}`,
      );
      return { awarded: 0, isNew: false, total: existing?.amount ?? amount };
    }
  }

  /** Total coins a student has banked. */
  async totalFor(studentId: number): Promise<number> {
    return (
      (await this.awards.sum('amount', { where: { studentId } })) ?? 0
    );
  }
}
