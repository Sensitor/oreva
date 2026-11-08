import { DEFAULT_LOCALE, isSupportedLocale, pickInitialLocale, type Locale } from '@oreva/i18n';

export const LOCALE_COOKIE = 'oreva_locale';

/**
 * The portal language: an explicit choice (cookie) wins, then the browser's
 * Accept-Language, then English.
 */
export function resolveRequestLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (isSupportedLocale(cookieValue)) {
    return cookieValue;
  }
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }
  const tags = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return { tag, q: q ? Number.parseFloat(q.slice(2)) : 1 };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.tag);
  return pickInitialLocale(tags);
}
