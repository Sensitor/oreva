import { describe, expect, it } from 'vitest';
import { createI18n } from './createI18n';
import { formattingLocale, pickInitialLocale } from './detect';
import { pseudoLocalize, pseudoLocalizeString } from './pseudo';
import { resources } from './resources';

describe('pickInitialLocale', () => {
  it('uses a supported system language instead of forcing English', () => {
    expect(pickInitialLocale(['fr-FR', 'en-GB'])).toBe('fr');
    expect(pickInitialLocale(['ru-RU'])).toBe('ru');
    expect(pickInitialLocale(['fr-MC'])).toBe('fr');
  });

  it('takes the first supported language in order of preference', () => {
    expect(pickInitialLocale(['de-DE', 'ru-RU', 'fr-FR'])).toBe('ru');
  });

  it('falls back to English for unsupported or missing languages', () => {
    expect(pickInitialLocale(['de-DE', 'ar-AE'])).toBe('en');
    expect(pickInitialLocale([])).toBe('en');
  });

  it('accepts underscores and odd casing', () => {
    expect(pickInitialLocale(['RU_ru'])).toBe('ru');
  });
});

describe('formattingLocale', () => {
  it('keeps the device region when the device uses the same language', () => {
    expect(formattingLocale('en', ['en-GB'])).toBe('en-GB');
    expect(formattingLocale('fr', ['fr-MC', 'en-US'])).toBe('fr-MC');
  });

  it('uses the bare language otherwise', () => {
    expect(formattingLocale('ru', ['fr-FR'])).toBe('ru');
  });
});

describe('createI18n', () => {
  const strict = (locale: 'en' | 'fr' | 'ru') =>
    createI18n({
      locale,
      onMissingKey: (lng, key) => {
        throw new Error(`Missing translation "${key}" for ${lng}`);
      },
    });

  it('translates in each language', () => {
    expect(strict('en').t('tabs.discover')).toBe('Discover');
    expect(strict('fr').t('tabs.discover')).toBe('Découvrir');
    expect(strict('ru').t('tabs.discover')).toBe('Обзор');
  });

  it('applies Russian plural rules (one / few / many)', () => {
    const t = strict('ru').t;
    expect(t('home.upcoming.spotsLeft', { count: 1 })).toBe('Осталось 1 место');
    expect(t('home.upcoming.spotsLeft', { count: 3 })).toBe('Осталось 3 места');
    expect(t('home.upcoming.spotsLeft', { count: 5 })).toBe('Осталось 5 мест');
    expect(t('home.upcoming.spotsLeft', { count: 21 })).toBe('Осталось 21 место');
    expect(t('home.upcoming.spotsLeft', { count: 12 })).toBe('Осталось 12 мест');
  });

  it('applies French plural rules (0 and 1 are singular)', () => {
    const t = strict('fr').t;
    expect(t('home.today.exercises', { count: 0 })).toBe('0 exercice');
    expect(t('home.today.exercises', { count: 1 })).toBe('1 exercice');
    expect(t('home.today.exercises', { count: 7 })).toBe('7 exercices');
  });

  it('applies English plural rules', () => {
    const t = strict('en').t;
    expect(t('home.upcoming.spotsLeft', { count: 1 })).toBe('1 spot left');
    expect(t('home.upcoming.spotsLeft', { count: 4 })).toBe('4 spots left');
  });

  it('switches language at runtime', async () => {
    const i18n = strict('en');
    await i18n.changeLanguage('ru');
    expect(i18n.t('tabs.home')).toBe('Главная');
  });

  it('reports missing keys instead of silently showing them', () => {
    expect(() => strict('en').t('does.not.exist')).toThrow(/Missing translation/);
  });
});

describe('pseudo-localisation', () => {
  it('keeps placeholders intact and lengthens text', () => {
    const out = pseudoLocalizeString('Day {{day}}');
    expect(out).toContain('{{day}}');
    expect(out.length).toBeGreaterThan('Day {{day}}'.length);
  });

  it('covers the whole tree', () => {
    const tree = pseudoLocalize(resources.en.translation) as { tabs: { home: string } };
    expect(tree.tabs.home).not.toBe('Home');
  });
});
