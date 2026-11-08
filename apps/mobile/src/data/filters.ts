import type { ClassFilters, ClassListItem } from './types';

function sameDayInZone(a: Date, b: Date, timeZone: string): boolean {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(a) === fmt.format(b);
}

/** Applies Discover filters. Pure, so the same rules can later run server-side. */
export function applyClassFilters(
  items: ClassListItem[],
  filters: ClassFilters,
  now: Date,
): ClassListItem[] {
  const weekLimit = now.getTime() + 7 * 86_400_000;
  return items
    .filter(({ session, city }) => {
      const start = new Date(session.startsAt);
      if (start.getTime() < now.getTime()) {
        return false;
      }
      if (filters.when === 'today' && !sameDayInZone(start, now, city.timeZone)) {
        return false;
      }
      if (filters.when === 'week' && start.getTime() > weekLimit) {
        return false;
      }
      if (
        filters.levels.length > 0 &&
        !filters.levels.includes(session.level) &&
        session.level !== 'all_levels'
      ) {
        return false;
      }
      if (filters.specialties.length > 0 && !filters.specialties.includes(session.specialty)) {
        return false;
      }
      if (filters.language && !session.instructionLanguages.includes(filters.language)) {
        return false;
      }
      if (filters.freeOnly && session.paymentMode !== 'free') {
        return false;
      }
      if (filters.availableOnly && session.spotsLeft <= 0) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt));
}

export function countActiveFilters(filters: ClassFilters): number {
  return (
    (filters.when !== 'any' ? 1 : 0) +
    filters.levels.length +
    filters.specialties.length +
    (filters.language ? 1 : 0) +
    (filters.freeOnly ? 1 : 0) +
    (filters.availableOnly ? 1 : 0)
  );
}
