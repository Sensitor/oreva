import type { City } from '@oreva/core';

/**
 * Cities used by the demo. Real cities, fictional content. In the real data,
 * only Monaco and the Côte d'Azur are live at launch (decision 6 of 8 Nov);
 * the demo marks every city live so the worldwide experience can be tested.
 */
export const demoCities: City[] = [
  {
    id: 'monaco',
    name: { en: 'Monaco', fr: 'Monaco', ru: 'Монако' },
    countryCode: 'MC',
    timeZone: 'Europe/Monaco',
    currency: 'EUR',
    center: { latitude: 43.7384, longitude: 7.4246 },
    launchStatus: 'live',
    isPlaceholder: true,
  },
  {
    id: 'nice',
    name: { en: 'Nice', fr: 'Nice', ru: 'Ницца' },
    countryCode: 'FR',
    timeZone: 'Europe/Paris',
    currency: 'EUR',
    center: { latitude: 43.7009, longitude: 7.2683 },
    launchStatus: 'live',
    isPlaceholder: true,
  },
  {
    id: 'cannes',
    name: { en: 'Cannes', fr: 'Cannes', ru: 'Канны' },
    countryCode: 'FR',
    timeZone: 'Europe/Paris',
    currency: 'EUR',
    center: { latitude: 43.5513, longitude: 7.0128 },
    launchStatus: 'live',
    isPlaceholder: true,
  },
  {
    id: 'paris',
    name: { en: 'Paris', fr: 'Paris', ru: 'Париж' },
    countryCode: 'FR',
    timeZone: 'Europe/Paris',
    currency: 'EUR',
    center: { latitude: 48.8566, longitude: 2.3522 },
    launchStatus: 'live',
    isPlaceholder: true,
  },
  {
    id: 'london',
    name: { en: 'London', fr: 'Londres', ru: 'Лондон' },
    countryCode: 'GB',
    timeZone: 'Europe/London',
    currency: 'GBP',
    center: { latitude: 51.5072, longitude: -0.1276 },
    launchStatus: 'live',
    isPlaceholder: true,
  },
  {
    id: 'dubai',
    name: { en: 'Dubai', fr: 'Dubaï', ru: 'Дубай' },
    countryCode: 'AE',
    timeZone: 'Asia/Dubai',
    currency: 'AED',
    center: { latitude: 25.2048, longitude: 55.2708 },
    launchStatus: 'live',
    isPlaceholder: true,
  },
  {
    id: 'new-york',
    name: { en: 'New York', fr: 'New York', ru: 'Нью-Йорк' },
    countryCode: 'US',
    timeZone: 'America/New_York',
    currency: 'USD',
    center: { latitude: 40.7128, longitude: -74.006 },
    launchStatus: 'live',
    isPlaceholder: true,
  },
];
