/** The member's week, from sessions finished on this phone only (never invented). */

/** Monday 00:00 of the week that holds `now`, in the phone's time zone. */
function startOfWeek(now: number): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

/** This week's sessions, day by day (Monday first), and the total, from this phone only. */
export function weekOf(completed: readonly { completedAt: string }[], now: number) {
  const start = startOfWeek(now).getTime();
  const days = [false, false, false, false, false, false, false];
  let week = 0;
  for (const entry of completed) {
    const at = new Date(entry.completedAt);
    if (at.getTime() >= start && at.getTime() <= now) {
      week += 1;
      days[(at.getDay() + 6) % 7] = true;
    }
  }
  return { week, total: completed.length, days };
}

/** One-letter day names, Monday first, in the member's language (M T W… / L M M… / П В С…). */
export function weekdayLabels(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  // 1 January 2024 was a Monday.
  return Array.from({ length: 7 }, (_, i) => format.format(new Date(2024, 0, 1 + i)));
}
