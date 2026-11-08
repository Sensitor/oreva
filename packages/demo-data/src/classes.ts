import {
  zonedDateAfter,
  zonedTimeToInstant,
  type ClassSession,
  type LocalizedText,
} from '@oreva/core';
import type { Locale } from '@oreva/i18n';
import { demoCities } from './cities';
import { demoVenues } from './venues';

const titles = {
  sunriseMat: { en: 'Sunrise mat', fr: 'Mat au lever du soleil', ru: 'Мат на рассвете' },
  seafrontFlow: { en: 'Seafront flow', fr: 'Flow en bord de mer', ru: 'Флоу на набережной' },
  reformerFoundations: {
    en: 'Reformer foundations',
    fr: 'Bases du reformer',
    ru: 'Основы реформера',
  },
  coreBreath: { en: 'Core & breath', fr: 'Centre et respiration', ru: 'Кор и дыхание' },
  barreBalance: { en: 'Barre & balance', fr: 'Barre et équilibre', ru: 'Барре и баланс' },
  parkMat: { en: 'Mat in the park', fr: 'Mat au parc', ru: 'Мат в парке' },
  eveningStretch: { en: 'Evening stretch', fr: 'Étirements du soir', ru: 'Вечерняя растяжка' },
  lunchReformer: { en: 'Lunchtime reformer', fr: 'Reformer de midi', ru: 'Реформер в обед' },
} satisfies Record<string, LocalizedText>;

type TitleKey = keyof typeof titles;

interface Slot {
  venueId: string;
  instructorId: string;
  title: TitleKey;
  /** Days after "now", in the venue's time zone. */
  day: number;
  hour: number;
  minute?: number;
  durationMin: number;
  level: ClassSession['level'];
  specialty: ClassSession['specialty'];
  capacity: number;
  spotsLeft: number;
  paymentMode: ClassSession['paymentMode'];
  priceMinor: number | null;
  languages: string[];
  source: Locale;
}

/** FICTIONAL schedule. Prices and times are invented for testing only. */
const slots: Slot[] = [
  // Monaco
  {
    venueId: 'ven-larvotto',
    instructorId: 'ins-lea',
    title: 'sunriseMat',
    day: 1,
    hour: 7,
    minute: 30,
    durationMin: 50,
    level: 'all_levels',
    specialty: 'outdoor',
    capacity: 12,
    spotsLeft: 4,
    paymentMode: 'pay_at_venue',
    priceMinor: 2500,
    languages: ['fr', 'en'],
    source: 'fr',
  },
  {
    venueId: 'ven-rivage-studio',
    instructorId: 'ins-anya',
    title: 'reformerFoundations',
    day: 1,
    hour: 12,
    minute: 30,
    durationMin: 45,
    level: 'beginner',
    specialty: 'reformer',
    capacity: 6,
    spotsLeft: 1,
    paymentMode: 'pay_at_venue',
    priceMinor: 4500,
    languages: ['en', 'ru'],
    source: 'en',
  },
  {
    venueId: 'ven-fontvieille',
    instructorId: 'ins-sofia',
    title: 'parkMat',
    day: 2,
    hour: 8,
    durationMin: 45,
    level: 'all_levels',
    specialty: 'mat',
    capacity: 15,
    spotsLeft: 9,
    paymentMode: 'free',
    priceMinor: null,
    languages: ['fr'],
    source: 'fr',
  },
  {
    venueId: 'ven-rivage-studio',
    instructorId: 'ins-lea',
    title: 'coreBreath',
    day: 3,
    hour: 18,
    minute: 30,
    durationMin: 50,
    level: 'intermediate',
    specialty: 'mat',
    capacity: 8,
    spotsLeft: 0,
    paymentMode: 'pay_at_venue',
    priceMinor: 3000,
    languages: ['fr', 'en'],
    source: 'fr',
  },
  {
    venueId: 'ven-larvotto',
    instructorId: 'ins-lea',
    title: 'seafrontFlow',
    day: 5,
    hour: 9,
    durationMin: 60,
    level: 'intermediate',
    specialty: 'outdoor',
    capacity: 12,
    spotsLeft: 6,
    paymentMode: 'pay_at_venue',
    priceMinor: 2500,
    languages: ['fr', 'en'],
    source: 'fr',
  },
  // Nice and Cannes
  {
    venueId: 'ven-lumen-studio',
    instructorId: 'ins-lea',
    title: 'barreBalance',
    day: 2,
    hour: 19,
    durationMin: 50,
    level: 'all_levels',
    specialty: 'barre',
    capacity: 10,
    spotsLeft: 3,
    paymentMode: 'pay_at_venue',
    priceMinor: 2800,
    languages: ['fr'],
    source: 'fr',
  },
  {
    venueId: 'ven-croisette',
    instructorId: 'ins-sofia',
    title: 'seafrontFlow',
    day: 4,
    hour: 8,
    durationMin: 50,
    level: 'beginner',
    specialty: 'outdoor',
    capacity: 14,
    spotsLeft: 10,
    paymentMode: 'free',
    priceMinor: null,
    languages: ['fr', 'en'],
    source: 'fr',
  },
  // Paris
  {
    venueId: 'ven-velours-studio',
    instructorId: 'ins-maya',
    title: 'lunchReformer',
    day: 1,
    hour: 12,
    minute: 30,
    durationMin: 45,
    level: 'intermediate',
    specialty: 'reformer',
    capacity: 8,
    spotsLeft: 2,
    paymentMode: 'pay_at_venue',
    priceMinor: 3800,
    languages: ['fr'],
    source: 'fr',
  },
  {
    venueId: 'ven-luxembourg',
    instructorId: 'ins-claire',
    title: 'parkMat',
    day: 2,
    hour: 9,
    durationMin: 50,
    level: 'all_levels',
    specialty: 'outdoor',
    capacity: 10,
    spotsLeft: 5,
    paymentMode: 'pay_at_venue',
    priceMinor: 2000,
    languages: ['fr', 'en'],
    source: 'fr',
  },
  {
    venueId: 'ven-monceau',
    instructorId: 'ins-claire',
    title: 'sunriseMat',
    day: 4,
    hour: 7,
    minute: 30,
    durationMin: 45,
    level: 'beginner',
    specialty: 'outdoor',
    capacity: 10,
    spotsLeft: 7,
    paymentMode: 'free',
    priceMinor: null,
    languages: ['fr'],
    source: 'fr',
  },
  // London
  {
    venueId: 'ven-regents-park',
    instructorId: 'ins-nora',
    title: 'parkMat',
    day: 1,
    hour: 8,
    durationMin: 50,
    level: 'all_levels',
    specialty: 'outdoor',
    capacity: 14,
    spotsLeft: 8,
    paymentMode: 'pay_at_venue',
    priceMinor: 1500,
    languages: ['en'],
    source: 'en',
  },
  {
    venueId: 'ven-linden-studio',
    instructorId: 'ins-hana',
    title: 'eveningStretch',
    day: 3,
    hour: 19,
    durationMin: 45,
    level: 'beginner',
    specialty: 'stretch',
    capacity: 12,
    spotsLeft: 4,
    paymentMode: 'pay_at_venue',
    priceMinor: 2200,
    languages: ['en'],
    source: 'en',
  },
  {
    venueId: 'ven-northbank-studio',
    instructorId: 'ins-anya',
    title: 'reformerFoundations',
    day: 2,
    hour: 18,
    minute: 30,
    durationMin: 50,
    level: 'beginner',
    specialty: 'reformer',
    capacity: 6,
    spotsLeft: 2,
    paymentMode: 'pay_at_venue',
    priceMinor: 3500,
    languages: ['en', 'ru'],
    source: 'en',
  },
  // Dubai
  {
    venueId: 'ven-kite-beach',
    instructorId: 'ins-zara',
    title: 'sunriseMat',
    day: 1,
    hour: 6,
    minute: 30,
    durationMin: 50,
    level: 'all_levels',
    specialty: 'outdoor',
    capacity: 16,
    spotsLeft: 11,
    paymentMode: 'pay_at_venue',
    priceMinor: 9000,
    languages: ['en'],
    source: 'en',
  },
  {
    venueId: 'ven-dune-studio',
    instructorId: 'ins-zara',
    title: 'coreBreath',
    day: 3,
    hour: 19,
    durationMin: 50,
    level: 'intermediate',
    specialty: 'mat',
    capacity: 10,
    spotsLeft: 3,
    paymentMode: 'pay_at_venue',
    priceMinor: 12000,
    languages: ['en'],
    source: 'en',
  },
  // New York
  {
    venueId: 'ven-sheep-meadow',
    instructorId: 'ins-hana',
    title: 'parkMat',
    day: 2,
    hour: 8,
    durationMin: 50,
    level: 'all_levels',
    specialty: 'outdoor',
    capacity: 20,
    spotsLeft: 12,
    paymentMode: 'free',
    priceMinor: null,
    languages: ['en'],
    source: 'en',
  },
  {
    venueId: 'ven-hudson-studio',
    instructorId: 'ins-hana',
    title: 'lunchReformer',
    day: 1,
    hour: 12,
    durationMin: 45,
    level: 'intermediate',
    specialty: 'reformer',
    capacity: 8,
    spotsLeft: 3,
    paymentMode: 'pay_at_venue',
    priceMinor: 4000,
    languages: ['en'],
    source: 'en',
  },
];

/** Builds the fictional schedule relative to `now`, in each venue's local time. */
export function buildDemoClasses(now: Date): ClassSession[] {
  return slots.map((slot, index) => {
    const venue = demoVenues.find((v) => v.id === slot.venueId);
    const city = demoCities.find((c) => c.id === venue?.cityId);
    if (!venue || !city) {
      throw new Error(`Demo slot ${index} references an unknown venue or city`);
    }
    const date = zonedDateAfter(now, slot.day, city.timeZone);
    const startsAt = zonedTimeToInstant(
      { ...date, hour: slot.hour, minute: slot.minute ?? 0 },
      city.timeZone,
    );
    return {
      id: `cls-${index + 1}`,
      organizationId: venue.organizationId,
      instructorId: slot.instructorId,
      venueId: venue.id,
      title: titles[slot.title],
      sourceLanguage: slot.source,
      instructionLanguages: slot.languages,
      startsAt: startsAt.toISOString(),
      durationMin: slot.durationMin,
      level: slot.level,
      specialty: slot.specialty,
      capacity: slot.capacity,
      spotsLeft: slot.spotsLeft,
      paymentMode: slot.paymentMode,
      priceMinor: slot.priceMinor,
      currency: city.currency,
      isPlaceholder: true,
    };
  });
}
