import { ScheduleSlot } from '@/database/models';
import { fromLocal, localParts, parseWallClock } from '@/common/tashkent';

/** The join button unlocks this many minutes before the lesson starts. */
export const JOIN_GRACE_MINUTES = 10;

const WEEKDAY_BY_UZBEK_NAME: Record<string, number> = {
  yakshanba: 0,
  dushanba: 1,
  seshanba: 2,
  chorshanba: 3,
  payshanba: 4,
  juma: 5,
  shanba: 6,
};

export interface ResolvedSlot {
  startsAt: Date;
  endsAt: Date;
  joinOpensAt: Date;
}

/* Walks the next fortnight of the group's weekly timetable and returns the
   first slot that has not finished yet — a lesson already under way still
   counts, because that is exactly when the student wants to join. */
export function nextSlot(
  schedule: ScheduleSlot[],
  now: Date,
): ResolvedSlot | null {
  if (!schedule?.length) return null;

  const { year, month, day } = localParts(now);
  let best: ResolvedSlot | null = null;

  /* Two weeks is enough to cover any weekly pattern, including a group whose
     only slot fell earlier today. */
  for (let offset = 0; offset < 14; offset += 1) {
    const probe = fromLocal(year, month, day + offset);
    const probeWeekday = localParts(probe).weekday;

    for (const slot of schedule) {
      if (WEEKDAY_BY_UZBEK_NAME[slot.day?.toLowerCase()] !== probeWeekday) {
        continue;
      }
      const startMinutes = parseWallClock(slot.start ?? '');
      const endMinutes = parseWallClock(slot.end ?? '');
      if (startMinutes === null || endMinutes === null) continue;

      const startsAt = fromLocal(year, month, day + offset, 0, startMinutes);
      const endsAt = fromLocal(year, month, day + offset, 0, endMinutes);
      if (endsAt <= now) continue;

      if (!best || startsAt < best.startsAt) {
        best = {
          startsAt,
          endsAt,
          joinOpensAt: new Date(
            startsAt.getTime() - JOIN_GRACE_MINUTES * 60_000,
          ),
        };
      }
    }

    /* Days are probed in order, so once a day yields a slot nothing later can
       beat it. */
    if (best) break;
  }

  return best;
}
