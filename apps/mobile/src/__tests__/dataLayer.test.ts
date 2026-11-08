import { describe, expect, it } from '@jest/globals';
import { resolveDataSource } from '@/data/dataSource';
import { createDemoRepositories } from '@/data/demoRepositories';
import { applyClassFilters, countActiveFilters } from '@/data/filters';
import { DEFAULT_CLASS_FILTERS } from '@/data/types';
import { createUnavailableRepositories } from '@/data/unavailableRepositories';

const NOW = new Date('2026-11-14T08:30:00Z');

describe('data source guard (C-2, C-3)', () => {
  it('uses demo data by default in development and staging', () => {
    expect(resolveDataSource('development', undefined)).toBe('demo');
    expect(resolveDataSource('staging', '')).toBe('demo');
  });

  it('never uses demo data in production', () => {
    expect(resolveDataSource('production', undefined)).toBe('unavailable');
    expect(() => resolveDataSource('production', 'demo')).toThrow(/not allowed in production/);
  });

  it('rejects unknown sources', () => {
    expect(() => resolveDataSource('development', 'supabase-typo')).toThrow();
  });

  it('production repositories return nothing rather than fictional content', async () => {
    const repos = createUnavailableRepositories();
    expect(await repos.discover.mapPoints()).toEqual([]);
    expect(await repos.practice.programs()).toEqual([]);
    expect(await repos.connect.circles()).toEqual([]);
  });
});

describe('Discover filters', () => {
  const repos = createDemoRepositories(NOW);

  it('returns upcoming classes sorted by time', async () => {
    const items = await repos.discover.classes(DEFAULT_CLASS_FILTERS, NOW);
    expect(items.length).toBeGreaterThan(10);
    const times = items.map((i) => i.session.startsAt);
    expect([...times].sort()).toEqual(times);
  });

  it('filters free classes, specialties, languages and availability', async () => {
    const all = await repos.discover.classes(DEFAULT_CLASS_FILTERS, NOW);
    const free = applyClassFilters(all, { ...DEFAULT_CLASS_FILTERS, freeOnly: true }, NOW);
    expect(free.length).toBeGreaterThan(0);
    expect(free.every((i) => i.session.paymentMode === 'free')).toBe(true);

    const reformer = applyClassFilters(
      all,
      { ...DEFAULT_CLASS_FILTERS, specialties: ['reformer'] },
      NOW,
    );
    expect(reformer.every((i) => i.session.specialty === 'reformer')).toBe(true);

    const russian = applyClassFilters(all, { ...DEFAULT_CLASS_FILTERS, language: 'ru' }, NOW);
    expect(russian.length).toBeGreaterThan(0);
    expect(russian.every((i) => i.session.instructionLanguages.includes('ru'))).toBe(true);

    const available = applyClassFilters(
      all,
      { ...DEFAULT_CLASS_FILTERS, availableOnly: true },
      NOW,
    );
    expect(available.every((i) => i.session.spotsLeft > 0)).toBe(true);
    expect(available.length).toBeLessThan(all.length);
  });

  it('keeps all-levels classes when filtering by level', async () => {
    const all = await repos.discover.classes(DEFAULT_CLASS_FILTERS, NOW);
    const beginner = applyClassFilters(
      all,
      { ...DEFAULT_CLASS_FILTERS, levels: ['beginner'] },
      NOW,
    );
    expect(beginner.every((i) => ['beginner', 'all_levels'].includes(i.session.level))).toBe(true);
  });

  it('counts active filters', () => {
    expect(countActiveFilters(DEFAULT_CLASS_FILTERS)).toBe(0);
    expect(
      countActiveFilters({
        ...DEFAULT_CLASS_FILTERS,
        when: 'today',
        freeOnly: true,
        levels: ['beginner'],
      }),
    ).toBe(3);
  });

  it('builds profiles with several affiliations', async () => {
    const lea = await repos.discover.instructor('ins-lea');
    expect(lea?.organizations.length).toBeGreaterThanOrEqual(2);
    const studio = await repos.discover.organization('org-atelier-rivage');
    expect(studio?.venues.length).toBe(2);
    expect(studio?.instructors.map((i) => i.id)).toContain('ins-anya');
  });
});
