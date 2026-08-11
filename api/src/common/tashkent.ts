/* Uzbekistan is UTC+5 year-round — it abolished DST in 1995 — so a fixed
   offset is correct here and avoids pulling in a tz database. Everything in
   the database is UTC; these helpers only exist to answer "which local day and
   time is this" for scheduling and streaks. */
export const TASHKENT_OFFSET_MINUTES = 5 * 60;

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;

/** The same instant, shifted so UTC getters read as Tashkent wall clock. */
function toLocal(instant: Date): Date {
  return new Date(instant.getTime() + TASHKENT_OFFSET_MINUTES * MS_PER_MINUTE);
}

/** Local wall-clock parts of an instant. */
export function localParts(instant: Date): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  /** 0 = Sunday, matching Date.getUTCDay. */
  weekday: number;
} {
  const local = toLocal(instant);
  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth(),
    day: local.getUTCDate(),
    hours: local.getUTCHours(),
    minutes: local.getUTCMinutes(),
    weekday: local.getUTCDay(),
  };
}

/** "2026-02-05" for the local calendar day an instant falls in. */
export function localDateKey(instant: Date): string {
  return toLocal(instant).toISOString().slice(0, 10);
}

/** The UTC instant of a local wall-clock time on a local calendar day. */
export function fromLocal(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
): Date {
  return new Date(
    Date.UTC(year, month, day, hours, minutes) -
      TASHKENT_OFFSET_MINUTES * MS_PER_MINUTE,
  );
}

/** Midnight local, as a UTC instant, `daysAhead` days from the given instant. */
export function localMidnight(instant: Date, daysAhead = 0): Date {
  const { year, month, day } = localParts(instant);
  return fromLocal(year, month, day + daysAhead);
}

/** Monday 00:00 local of the week containing `instant`, as a UTC instant. */
export function localWeekStart(instant: Date): Date {
  const { weekday } = localParts(instant);
  /* Sunday is 0 in JS but the last day of an Uzbek week. */
  const daysSinceMonday = (weekday + 6) % 7;
  return localMidnight(instant, -daysSinceMonday);
}

/** The seven local date keys of the week containing `instant`, Monday first. */
export function localWeekKeys(instant: Date): string[] {
  const monday = localWeekStart(instant);
  return Array.from({ length: 7 }, (_, index) =>
    localDateKey(new Date(monday.getTime() + index * MS_PER_DAY)),
  );
}

/**
 * "2026-08-11" for a calendar date given as its parts, normalising overflow
 * (day 32 rolls into the next month).
 *
 * Not the same as localDateKey: this takes calendar parts, that takes an
 * instant. Building the key by shifting through fromLocal() and slicing the
 * ISO string is wrong — that lands on the UTC instant of local midnight, which
 * is the previous day.
 */
export function calendarDateKey(year: number, month: number, day: number): string {
  const normalised = new Date(Date.UTC(year, month, day));
  const mm = String(normalised.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(normalised.getUTCDate()).padStart(2, '0');
  return `${normalised.getUTCFullYear()}-${mm}-${dd}`;
}

/* Timetables store the weekday as the Uzbek name the UI shows, so anything
   reading a schedule has to map it back to JS's 0-Sunday numbering. */
export const WEEKDAY_BY_UZBEK_NAME: Readonly<Record<string, number>> = {
  yakshanba: 0,
  dushanba: 1,
  seshanba: 2,
  chorshanba: 3,
  payshanba: 4,
  juma: 5,
  shanba: 6,
};

/** JS weekday number for an Uzbek weekday name, or null if unrecognised. */
export function weekdayFromUzbekName(name: string | undefined): number | null {
  const index = WEEKDAY_BY_UZBEK_NAME[name?.trim().toLowerCase() ?? ''];
  return index === undefined ? null : index;
}

/** Parses "17:00" into minutes past local midnight. */
export function parseWallClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}
