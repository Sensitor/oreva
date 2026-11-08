import i18next, { type i18n as I18nInstance, type InitOptions, type Module } from 'i18next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './locales';
import { resources } from './resources';

export interface CreateI18nOptions {
  locale: Locale;
  /** Extra i18next plugins, e.g. `initReactI18next` from react-i18next. */
  plugins?: Module[];
  /**
   * Called when a key is missing. Tests pass a function that throws, so a missing
   * key fails the build instead of showing a raw key to a member.
   */
  onMissingKey?: (locale: string, key: string) => void;
}

/**
 * Creates an initialised, independent i18next instance. Resources are bundled,
 * so initialisation is synchronous.
 */
export function createI18n({
  locale,
  plugins = [],
  onMissingKey,
}: CreateI18nOptions): I18nInstance {
  const instance = i18next.createInstance();
  for (const plugin of plugins) {
    instance.use(plugin);
  }

  const options: InitOptions = {
    resources,
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    initAsync: false,
    interpolation: {
      // React and React Native escape output already.
      escapeValue: false,
    },
    returnNull: false,
    saveMissing: Boolean(onMissingKey),
    missingKeyHandler: onMissingKey
      ? (lngs, _ns, key) => {
          onMissingKey(lngs.join(','), key);
        }
      : undefined,
  };

  void instance.init(options);
  return instance;
}
