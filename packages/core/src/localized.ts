import { DEFAULT_LOCALE, type Locale } from '@oreva/i18n';

/**
 * Localized content as stored in the database (decision D-04): one JSONB value
 * per field, e.g. { "en": "Sunrise Mat", "fr": "Mat au lever du soleil" }.
 * Workouts and classes may only exist in their source language (A-03).
 */
export type LocalizedText = Partial<Record<Locale, string>>;

export interface ResolvedText {
  text: string;
  /** The language the text is actually in. */
  locale: Locale;
  /** True when the member's language was not available. The UI shows the language in that case. */
  isFallback: boolean;
}

/**
 * Picks the best available text: the member's language, then English, then the
 * content's source language. Returns null when nothing usable exists.
 */
export function resolveLocalizedText(
  value: LocalizedText | null | undefined,
  locale: Locale,
  sourceLocale?: Locale,
): ResolvedText | null {
  if (!value) {
    return null;
  }
  const order: Locale[] = [locale, DEFAULT_LOCALE];
  if (sourceLocale) {
    order.push(sourceLocale);
  }
  for (const candidate of order) {
    const text = value[candidate]?.trim();
    if (text) {
      return { text, locale: candidate, isFallback: candidate !== locale };
    }
  }
  return null;
}
