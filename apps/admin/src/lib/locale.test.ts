import { describe, expect, it } from 'vitest';
import { resolveRequestLocale } from './locale';

describe('resolveRequestLocale', () => {
  it('prefers an explicit choice', () => {
    expect(resolveRequestLocale('ru', 'fr-FR,fr;q=0.9')).toBe('ru');
  });

  it('ignores unsupported cookie values', () => {
    expect(resolveRequestLocale('de', 'fr-FR')).toBe('fr');
  });

  it('follows Accept-Language weights', () => {
    expect(resolveRequestLocale(undefined, 'de-DE,ru;q=0.8,fr;q=0.9')).toBe('fr');
    expect(resolveRequestLocale(undefined, 'en;q=0, ru')).toBe('ru');
  });

  it('falls back to English', () => {
    expect(resolveRequestLocale(undefined, null)).toBe('en');
    expect(resolveRequestLocale(undefined, 'de-DE, ar')).toBe('en');
  });
});
