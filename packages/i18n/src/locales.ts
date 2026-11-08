/**
 * Supported interface languages.
 *
 * English is the brand default and the fallback (cahier des charges, Addendum A).
 * Adding a language later (decision P-06) means: add a JSON file, add an entry
 * here, add a row to the `locales` database table. The parity tests then force
 * every key and plural form to exist.
 */
export const SUPPORTED_LOCALES = ['en', 'fr', 'ru'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export interface LocaleInfo {
  /** Name in its own language, shown in the language picker. */
  nativeName: string;
  /** Right-to-left script. None of the launch languages are RTL; the layout is prepared for it. */
  rtl: boolean;
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: { nativeName: 'English', rtl: false },
  fr: { nativeName: 'Français', rtl: false },
  ru: { nativeName: 'Русский', rtl: false },
};

export function isSupportedLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
