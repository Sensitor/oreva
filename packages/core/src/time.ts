export type DayPeriod = 'morning' | 'afternoon' | 'evening';

/** Greeting period in a given time zone: morning 05:00 to 11:59, afternoon 12:00 to 17:59, evening otherwise. */
export function dayPeriod(instant: Date, timeZone: string): DayPeriod {
  const hourText = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(instant);
  const hour = Number.parseInt(hourText, 10);
  if (hour >= 5 && hour < 12) {
    return 'morning';
  }
  if (hour >= 12 && hour < 18) {
    return 'afternoon';
  }
  return 'evening';
}

/** Offset in minutes between a time zone's wall clock and UTC at a given instant (Monaco winter: +60). */
export function timeZoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return Math.round((asUtc - Math.floor(instant.getTime() / 1000) * 1000) / 60000);
}

export interface WallClockTime {
  year: number;
  /** 1 to 12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/**
 * Converts a wall-clock time in an IANA time zone to the exact instant, e.g.
 * "8:00 on 15 Nov in Europe/Monaco" -> 2026-11-15T07:00:00Z. Used when an
 * organizer schedules a class in the venue's local time. For times skipped by a
 * daylight-saving jump, the result moves forward by the gap.
 */
export function zonedTimeToInstant(time: WallClockTime, timeZone: string): Date {
  const guess = Date.UTC(time.year, time.month - 1, time.day, time.hour, time.minute);
  const firstOffset = timeZoneOffsetMinutes(new Date(guess), timeZone);
  let instant = guess - firstOffset * 60000;
  const secondOffset = timeZoneOffsetMinutes(new Date(instant), timeZone);
  if (secondOffset !== firstOffset) {
    instant = guess - secondOffset * 60000;
  }
  return new Date(instant);
}

/** The calendar date (in a time zone) a number of days after an instant. */
export function zonedDateAfter(
  instant: Date,
  days: number,
  timeZone: string,
): Pick<WallClockTime, 'year' | 'month' | 'day'> {
  const later = new Date(instant.getTime() + days * 86400000);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(later);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');
  return { year: get('year'), month: get('month'), day: get('day') };
}
