import { LessonItem, Unit } from '@/database/models';
import { UnitStatus } from './lessons.types';

/** A unit's title is stored as "Unit 5.2 — Present Perfect". */
export function splitUnitTitle(stored: string): { code: string; title: string } {
  const [code, ...rest] = stored.split('—');
  const title = rest.join('—').trim();
  return {
    code: code.trim(),
    /* Some units carry no dash; then the whole string is the title. */
    title: title || code.trim(),
  };
}

export function unitPercent(
  items: LessonItem[],
  percentByItemId: Map<number, number>,
): number {
  if (!items.length) return 0;
  const total = items.reduce(
    (sum, item) => sum + (percentByItemId.get(item.id) ?? 0),
    0,
  );
  return Math.round(total / items.length);
}

export interface UnitLockState {
  locked: boolean;
  status: UnitStatus;
  percent: number;
}

/* The locking rule, in one place and on the server only: a unit opens when the
   one before it reaches 100%. The first unit — and anything an admin has
   explicitly unlocked via is_locked_by_default — is always open. The client is
   never asked to work this out; it receives `locked` already decided. */
export function resolveUnitStates(
  units: (Unit & { items?: LessonItem[] })[],
  percentByItemId: Map<number, number>,
): Map<number, UnitLockState> {
  const states = new Map<number, UnitLockState>();
  let previousPercent: number | null = null;
  let currentAssigned = false;

  for (const unit of units) {
    const percent = unitPercent(unit.items ?? [], percentByItemId);
    const openedByRule = previousPercent === null || previousPercent === 100;
    const locked = unit.isLockedByDefault && !openedByRule;

    let status: UnitStatus;
    if (locked) {
      status = 'locked';
    } else if (percent === 100) {
      status = 'completed';
    } else if (!currentAssigned) {
      /* The first open, unfinished unit is where the student is. */
      status = 'current';
      currentAssigned = true;
    } else {
      status = 'available';
    }

    states.set(unit.id, { locked, status, percent });
    previousPercent = percent;
  }

  return states;
}
