import en from '../locales/en.json';
import fr from '../locales/fr.json';
import ru from '../locales/ru.json';
import type { Locale } from './locales';

export type TranslationTree = typeof en;

/** All translations, keyed by locale. English is the reference for key parity. */
export const resources: Record<Locale, { translation: Record<string, unknown> }> = {
  en: { translation: en },
  fr: { translation: fr },
  ru: { translation: ru },
};
