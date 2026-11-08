import { zonedDateAfter, zonedTimeToInstant, type LocalizedText } from '@oreva/core';

/**
 * SAMPLE DATA for the static Phase 1 Home screen.
 *
 * Nothing here describes a real partner, instructor, class, price or schedule
 * (decision A-06). Every item is shown with a visible "Sample data" badge in
 * development and staging builds, and this file is replaced by real queries in
 * Phases 3 to 5.
 */

export const SAMPLE_TIME_ZONE = 'Europe/Monaco';

export interface SampleTodaySession {
  isPlaceholder: true;
  programTitle: LocalizedText;
  day: number;
  exercises: number;
  minutes: number;
}

export interface SampleClass {
  isPlaceholder: true;
  id: string;
  title: LocalizedText;
  location: LocalizedText;
  startsAt: Date;
  timeZone: string;
  spotsLeft: number;
  tone: 'tileMint' | 'tileOrchid' | 'tileViolet';
}

export interface SampleProgram {
  isPlaceholder: true;
  id: string;
  title: LocalizedText;
  weeks: number;
  tone: 'tileMint' | 'tileOrchid' | 'tileViolet';
}

export const CATEGORY_KEYS = [
  'all',
  'core',
  'fullBody',
  'lowerBody',
  'upperBody',
  'mobility',
  'breath',
] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const sampleToday: SampleTodaySession = {
  isPlaceholder: true,
  programTitle: { en: 'Pilates foundations', fr: 'Les bases du Pilates', ru: 'Основы пилатеса' },
  day: 1,
  exercises: 7,
  minutes: 6,
};

function sampleStart(now: Date, daysAhead: number, hour: number): Date {
  const date = zonedDateAfter(now, daysAhead, SAMPLE_TIME_ZONE);
  return zonedTimeToInstant({ ...date, hour, minute: 0 }, SAMPLE_TIME_ZONE);
}

export function sampleClasses(now: Date = new Date()): SampleClass[] {
  return [
    {
      isPlaceholder: true,
      id: 'sample-sunrise',
      title: { en: 'Sunrise mat flow', fr: 'Mat flow au lever du soleil', ru: 'Утренний мат-флоу' },
      location: { en: 'Seafront, Monaco', fr: 'Bord de mer, Monaco', ru: 'Набережная, Монако' },
      startsAt: sampleStart(now, 1, 8),
      timeZone: SAMPLE_TIME_ZONE,
      spotsLeft: 3,
      tone: 'tileMint',
    },
    {
      isPlaceholder: true,
      id: 'sample-sunset',
      title: {
        en: 'Sunset core & breath',
        fr: 'Centre et respiration au coucher du soleil',
        ru: 'Кор и дыхание на закате',
      },
      location: {
        en: 'Garden terrace, Monaco',
        fr: 'Terrasse jardin, Monaco',
        ru: 'Садовая терраса, Монако',
      },
      startsAt: sampleStart(now, 2, 18),
      timeZone: SAMPLE_TIME_ZONE,
      spotsLeft: 1,
      tone: 'tileOrchid',
    },
  ];
}

export const samplePrograms: SampleProgram[] = [
  {
    isPlaceholder: true,
    id: 'sample-foundations',
    title: {
      en: 'Beginner foundations',
      fr: 'Fondamentaux débutante',
      ru: 'Основы для начинающих',
    },
    weeks: 4,
    tone: 'tileViolet',
  },
  {
    isPlaceholder: true,
    id: 'sample-travel',
    title: { en: 'Pilates on the go', fr: 'Pilates en voyage', ru: 'Пилатес в поездках' },
    weeks: 2,
    tone: 'tileMint',
  },
];
