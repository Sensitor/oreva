import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from './locales';

/**
 * Picks the first-launch language from the device's preferred languages
 * (most preferred first, e.g. ["ru-RU", "en-GB"]).
 *
 * A supported system language is used as-is: French or Russian phones are never
 * forced into English. Unknown languages fall back to English. The member can
 * always change it manually afterwards.
 */
export function pickInitialLocale(preferredLanguageTags: readonly string[]): Locale {
  for (const tag of preferredLanguageTags) {
    const language = tag.toLowerCase().split(/[-_]/)[0];
    if (isSupportedLocale(language)) {
      return language;
    }
  }
  return DEFAULT_LOCALE;
}

/**
 * The BCP 47 tag used for Intl formatting: the chosen interface language, plus
 * the device region when the device uses that same language (so an English UI on
 * a British phone formats dates the British way).
 */
export function formattingLocale(language: Locale, deviceLanguageTags: readonly string[]): string {
  for (const tag of deviceLanguageTags) {
    const [lang, ...rest] = tag.split(/[-_]/);
    const region = rest.find((part) => /^[A-Za-z]{2}$|^\d{3}$/.test(part));
    if (lang?.toLowerCase() === language && region) {
      return `${language}-${region.toUpperCase()}`;
    }
  }
  return language;
}
