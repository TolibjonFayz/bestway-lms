/* Everything from the API is UTC. The centre is in Tashkent, which has been a
   fixed UTC+5 since 1995 — no DST — so a constant offset is correct and saves
   shipping a timezone database to the browser. */
const TASHKENT_OFFSET_MINUTES = 5 * 60
const MS_PER_MINUTE = 60_000

const MONTHS_GENITIVE = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
]

/* Hand-picked, not a blind 3-letter slice: "iyun" and "iyul" both truncate to
   "iyu", which would make June and July rows indistinguishable in the marks
   list. */
const MONTHS_SHORT = [
  'yan', 'fev', 'mar', 'apr', 'may', 'iyun',
  'iyul', 'avg', 'sen', 'okt', 'noy', 'dek',
]

/** Sunday first, matching Date.getUTCDay. */
const WEEKDAYS = [
  'yakshanba',
  'dushanba',
  'seshanba',
  'chorshanba',
  'payshanba',
  'juma',
  'shanba',
]

function toTashkent(value) {
  const instant = value instanceof Date ? value : new Date(value)
  return new Date(instant.getTime() + TASHKENT_OFFSET_MINUTES * MS_PER_MINUTE)
}

export function useUzbekDate() {
  /** "5-fevral, seshanba" — the form the design uses. */
  function longDate(value) {
    if (!value) return ''
    const local = toTashkent(value)
    const day = local.getUTCDate()
    const month = MONTHS_GENITIVE[local.getUTCMonth()]
    const weekday = WEEKDAYS[local.getUTCDay()]
    return `${day}-${month}, ${weekday}`
  }

  /** "17:00" in Tashkent wall-clock. */
  function time(value) {
    if (!value) return ''
    const local = toTashkent(value)
    const hours = String(local.getUTCHours()).padStart(2, '0')
    const minutes = String(local.getUTCMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  /** "5-fevral, seshanba · 17:00" — the mobile card's single line. */
  function dateAndTime(value) {
    if (!value) return ''
    return `${longDate(value)} · ${time(value)}`
  }

  /** "5-fev" — the compact form the marks list uses per row. */
  function shortDate(value) {
    if (!value) return ''
    const local = toTashkent(value)
    return `${local.getUTCDate()}-${MONTHS_SHORT[local.getUTCMonth()]}`
  }

  /** "12-sentabr, 2025" — the profile screen's join date, no weekday. */
  function memberSince(value) {
    if (!value) return ''
    const local = toTashkent(value)
    return `${local.getUTCDate()}-${MONTHS_GENITIVE[local.getUTCMonth()]}, ${local.getUTCFullYear()}`
  }

  return { longDate, shortDate, memberSince, time, dateAndTime }
}

/** Monday 00:00 (Tashkent) of the week containing `value`. */
function weekStart(value) {
  const local = toTashkent(value)
  const daysSinceMonday = (local.getUTCDay() + 6) % 7
  const monday = new Date(local)
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday)
  monday.setUTCHours(0, 0, 0, 0)
  return monday
}

/** A stable per-week grouping key, independent of display format. */
export function weekKey(value) {
  return weekStart(value).toISOString().slice(0, 10)
}

/** "3–9 fevral" (or "29 iyun – 5 iyul" across a month boundary). */
export function weekRangeLabel(value) {
  const start = weekStart(value)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)

  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${start.getUTCDate()}–${end.getUTCDate()} ${MONTHS_GENITIVE[end.getUTCMonth()]}`
  }
  return (
    `${start.getUTCDate()} ${MONTHS_GENITIVE[start.getUTCMonth()]} – ` +
    `${end.getUTCDate()} ${MONTHS_GENITIVE[end.getUTCMonth()]}`
  )
}

/** "Fevral 2026" from the API's "2026-02". */
export function monthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  const name = MONTHS_GENITIVE[month - 1] ?? ''
  return `${name.charAt(0).toLocaleUpperCase('uz')}${name.slice(1)} ${year}`
}

/** "2026-02" shifted by `delta` whole months, wrapping the year. */
export function shiftMonth(yearMonth, delta) {
  const [year, month] = yearMonth.split('-').map(Number)
  const zeroBased = month - 1 + delta
  const nextYear = year + Math.floor(zeroBased / 12)
  const nextMonth = ((zeroBased % 12) + 12) % 12
  return `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}`
}

/** "2026-02" for the current Tashkent month. */
export function currentMonthKey() {
  const local = toTashkent(new Date())
  return `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, '0')}`
}

/** Thousands separated by a space, as the design renders coins and points. */
export function formatCount(value) {
  return Number(value ?? 0)
    .toLocaleString('en-US')
    .replace(/,/g, ' ')
}
