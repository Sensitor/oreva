import { describe, expect, it } from 'vitest';
import {
  currencyMinorUnits,
  distanceUnitFor,
  formatClassDateTime,
  formatDistance,
  formatPrice,
} from './format';

// Normalise the narrow and regular no-break spaces (U+202F, U+00A0) that Intl inserts.
const n = (value: string) => value.replace(/[\u00a0\u202f]/g, ' ');

describe('formatClassDateTime', () => {
  // 07:00 UTC on Saturday 15 November 2026 is 08:00 in Monaco (UTC+1 in winter).
  const instant = new Date('2026-11-15T07:00:00Z');

  it('shows the class in its own time zone, not the phone one', () => {
    expect(formatClassDateTime(instant, 'fr', 'Europe/Monaco').time).toBe('08:00');
    expect(formatClassDateTime(instant, 'en-GB', 'Europe/London').time).toBe('07:00');
  });

  it('formats dates per language', () => {
    expect(n(formatClassDateTime(instant, 'en-GB', 'Europe/Monaco').date)).toBe('Sun 15 Nov');
    expect(n(formatClassDateTime(instant, 'fr', 'Europe/Monaco').date)).toBe('dim. 15 nov.');
    expect(formatClassDateTime(instant, 'ru', 'Europe/Monaco').date).toMatch(/15 нояб/);
  });

  it('handles the summer time change in Monaco', () => {
    // 06:00 UTC on 1 July 2026 is 08:00 in Monaco (UTC+2 in summer).
    expect(formatClassDateTime(new Date('2026-07-01T06:00:00Z'), 'fr', 'Europe/Monaco').time).toBe(
      '08:00',
    );
  });
});

describe('formatPrice', () => {
  it('formats minor units with the right currency rules', () => {
    expect(n(formatPrice(2500, 'EUR', 'fr'))).toBe('25 €');
    expect(n(formatPrice(2550, 'EUR', 'en'))).toBe('€25.50');
    expect(n(formatPrice(3000, 'GBP', 'en-GB'))).toBe('£30');
    expect(n(formatPrice(1500, 'JPY', 'en'))).toBe('¥1,500');
    expect(n(formatPrice(15000, 'AED', 'en'))).toBe('AED 150');
  });

  it('rejects non-integer amounts', () => {
    expect(() => formatPrice(25.5, 'EUR', 'en')).toThrow();
  });

  it('knows minor units per currency', () => {
    expect(currencyMinorUnits('EUR')).toBe(2);
    expect(currencyMinorUnits('JPY')).toBe(0);
    expect(currencyMinorUnits('KWD')).toBe(3);
  });
});

describe('formatDistance', () => {
  it('uses miles where people expect miles', () => {
    expect(distanceUnitFor('en-GB')).toBe('mile');
    expect(distanceUnitFor('en-US')).toBe('mile');
    expect(distanceUnitFor('en')).toBe('mile');
    expect(distanceUnitFor('fr')).toBe('kilometer');
    expect(distanceUnitFor('ru')).toBe('kilometer');
  });

  it('formats short and long distances', () => {
    expect(n(formatDistance(2500, 'fr'))).toBe('2,5 km');
    expect(n(formatDistance(2500, 'ru'))).toBe('2,5 км');
    expect(n(formatDistance(16093.44, 'en-GB'))).toBe('10 mi');
  });
});
