import { describe, expect, it } from 'vitest';
import { resolveLocalizedText } from './localized';
import { dayPeriod, zonedDateAfter, zonedTimeToInstant } from './time';

describe('resolveLocalizedText', () => {
  const title = { en: 'Sunrise Mat', fr: 'Mat au lever du soleil' };

  it('returns the member language when available', () => {
    expect(resolveLocalizedText(title, 'fr')).toEqual({
      text: 'Mat au lever du soleil',
      locale: 'fr',
      isFallback: false,
    });
  });

  it('falls back to English and says so', () => {
    expect(resolveLocalizedText(title, 'ru')).toEqual({
      text: 'Sunrise Mat',
      locale: 'en',
      isFallback: true,
    });
  });

  it('falls back to the source language for source-only content', () => {
    expect(resolveLocalizedText({ fr: 'Cours en français' }, 'ru', 'fr')).toEqual({
      text: 'Cours en français',
      locale: 'fr',
      isFallback: true,
    });
  });

  it('ignores blank values and handles missing content', () => {
    expect(resolveLocalizedText({ en: '  ', fr: 'Bonjour' }, 'en', 'fr')?.locale).toBe('fr');
    expect(resolveLocalizedText(null, 'en')).toBeNull();
    expect(resolveLocalizedText({}, 'en')).toBeNull();
  });
});

describe('dayPeriod', () => {
  it('uses the given time zone', () => {
    const instant = new Date('2026-11-15T10:30:00Z'); // 11:30 in Monaco, 13:30 in Dubai
    expect(dayPeriod(instant, 'Europe/Monaco')).toBe('morning');
    expect(dayPeriod(instant, 'Asia/Dubai')).toBe('afternoon');
  });

  it('handles boundaries', () => {
    expect(dayPeriod(new Date('2026-11-15T04:00:00Z'), 'Europe/Monaco')).toBe('morning'); // 05:00
    expect(dayPeriod(new Date('2026-11-15T03:59:00Z'), 'Europe/Monaco')).toBe('evening'); // 04:59
    expect(dayPeriod(new Date('2026-11-15T17:00:00Z'), 'Europe/Monaco')).toBe('evening'); // 18:00
  });
});

describe('zonedTimeToInstant', () => {
  it('converts Monaco winter and summer times', () => {
    expect(
      zonedTimeToInstant(
        { year: 2026, month: 11, day: 15, hour: 8, minute: 0 },
        'Europe/Monaco',
      ).toISOString(),
    ).toBe('2026-11-15T07:00:00.000Z');
    expect(
      zonedTimeToInstant(
        { year: 2026, month: 7, day: 1, hour: 8, minute: 0 },
        'Europe/Monaco',
      ).toISOString(),
    ).toBe('2026-07-01T06:00:00.000Z');
  });

  it('handles other zones used by the marketplace', () => {
    expect(
      zonedTimeToInstant(
        { year: 2026, month: 11, day: 15, hour: 8, minute: 0 },
        'Asia/Dubai',
      ).toISOString(),
    ).toBe('2026-11-15T04:00:00.000Z');
    expect(
      zonedTimeToInstant(
        { year: 2026, month: 11, day: 15, hour: 8, minute: 0 },
        'Europe/London',
      ).toISOString(),
    ).toBe('2026-11-15T08:00:00.000Z');
  });

  it('is correct on the day clocks change (29 March 2026, 02:00 -> 03:00 in Monaco)', () => {
    expect(
      zonedTimeToInstant(
        { year: 2026, month: 3, day: 29, hour: 1, minute: 30 },
        'Europe/Monaco',
      ).toISOString(),
    ).toBe('2026-03-29T00:30:00.000Z');
    expect(
      zonedTimeToInstant(
        { year: 2026, month: 3, day: 29, hour: 8, minute: 0 },
        'Europe/Monaco',
      ).toISOString(),
    ).toBe('2026-03-29T06:00:00.000Z');
    // 02:30 does not exist that night; it resolves to 03:30 local.
    expect(
      zonedTimeToInstant(
        { year: 2026, month: 3, day: 29, hour: 2, minute: 30 },
        'Europe/Monaco',
      ).toISOString(),
    ).toBe('2026-03-29T01:30:00.000Z');
  });
});

describe('zonedDateAfter', () => {
  it('returns the local calendar date', () => {
    // 23:30 UTC on 14 Nov is already 15 Nov in Monaco.
    expect(zonedDateAfter(new Date('2026-11-14T23:30:00Z'), 0, 'Europe/Monaco')).toEqual({
      year: 2026,
      month: 11,
      day: 15,
    });
    expect(zonedDateAfter(new Date('2026-11-14T23:30:00Z'), 1, 'Europe/Monaco')).toEqual({
      year: 2026,
      month: 11,
      day: 16,
    });
  });
});
