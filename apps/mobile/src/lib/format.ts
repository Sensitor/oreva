import type { City, ClassSession } from '@oreva/core';
import { formatClassDateTime, formatPrice } from '@oreva/i18n';
import type { TFunction } from 'i18next';

/** "Free" or "€25, paid at the venue" (P-04: price is display-only in V1). */
export function priceLabel(session: ClassSession, t: TFunction, formatLocale: string): string {
  if (session.paymentMode === 'free' || session.priceMinor === null) {
    return t('classDetail.free');
  }
  return t('classDetail.payAtVenue', {
    price: formatPrice(session.priceMinor, session.currency, formatLocale),
  });
}

/** Names of languages, e.g. "French, English". A list of names, not a sentence. */
export function languagesLabel(codes: string[], t: TFunction): string {
  return codes
    .map((code) => t(`spokenLanguage.${code}`, { defaultValue: code.toUpperCase() }))
    .join(', ');
}

/** Date and time of a class in its city's time zone. */
export function classWhen(session: ClassSession, city: City, formatLocale: string) {
  return formatClassDateTime(new Date(session.startsAt), formatLocale, city.timeZone);
}
