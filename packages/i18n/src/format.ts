/**
 * Locale-aware formatters built on Intl. Never build dates, prices or distances
 * by concatenating strings.
 */

export interface DateTimeParts {
  /** e.g. "Sat 15 Nov" / "sam. 15 nov." / "сб, 15 нояб." */
  date: string;
  /** e.g. "08:00" or "8:00 AM", following the locale. */
  time: string;
}

/**
 * Formats an instant in a given IANA time zone. Classes are always shown in the
 * class's own time zone (e.g. Europe/Monaco), not the phone's.
 */
export function formatClassDateTime(
  instant: Date,
  locale: string,
  timeZone: string,
): DateTimeParts {
  const date = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone,
  }).format(instant);
  const time = new Intl.DateTimeFormat(locale, { timeStyle: 'short', timeZone }).format(instant);
  return { date, time };
}

/** Number of minor units for a currency (EUR 2, JPY 0, KWD 3), from Intl. */
export function currencyMinorUnits(currency: string): number {
  return (
    new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
      .maximumFractionDigits ?? 2
  );
}

/**
 * Formats a price stored in minor units (decision P-07: amounts are integers in
 * minor units with an ISO 4217 currency; no FX conversion).
 */
export function formatPrice(amountMinor: number, currency: string, locale: string): string {
  if (!Number.isInteger(amountMinor)) {
    throw new Error('Prices must be integers in minor units.');
  }
  const digits = currencyMinorUnits(currency);
  const amount = amountMinor / 10 ** digits;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: amountMinor % 10 ** digits === 0 ? 0 : digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

/** Regions where everyday distances are given in miles. */
const MILE_REGIONS = new Set(['US', 'GB', 'LR', 'MM']);

export type DistanceUnit = 'kilometer' | 'mile';

export function distanceUnitFor(locale: string): DistanceUnit {
  const region = new Intl.Locale(locale).maximize().region;
  return region && MILE_REGIONS.has(region) ? 'mile' : 'kilometer';
}

/** Formats a distance in metres for display in Discover. */
export function formatDistance(
  meters: number,
  locale: string,
  unit: DistanceUnit = distanceUnitFor(locale),
): string {
  const value = unit === 'mile' ? meters / 1609.344 : meters / 1000;
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    unitDisplay: 'short',
    maximumFractionDigits: value < 10 ? 1 : 0,
  }).format(value);
}
