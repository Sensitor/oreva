import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createI18n,
  formattingLocale,
  isSupportedLocale,
  pickInitialLocale,
  type Locale,
} from '@oreva/i18n';
import { getLocales } from 'expo-localization';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

const STORAGE_KEY = 'oreva.locale';

/**
 * Language choice is kept on the device for now. From Phase 2 it is also saved
 * to the member's profile (profiles.locale) so push notifications use it.
 */
interface LocaleContextValue {
  locale: Locale;
  /** BCP 47 tag for Intl formatting (language + device region when they match). */
  formatLocale: string;
  setLocale: (locale: Locale) => Promise<void>;
  /** True once the stored preference has been read. */
  ready: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function deviceLanguageTags(): string[] {
  try {
    return getLocales().map((entry) => entry.languageTag);
  } catch {
    return [];
  }
}

interface I18nProviderProps {
  children: ReactNode;
  /** Forces a language (tests, previews). */
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const deviceTags = useMemo(() => deviceLanguageTags(), []);
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? pickInitialLocale(deviceTags));
  const [ready, setReady] = useState(Boolean(initialLocale));

  const i18n = useMemo(
    () =>
      createI18n({
        locale,
        plugins: [initReactI18next],
        onMissingKey: __DEV__
          ? (lng, key) => {
              console.warn(`[i18n] Missing translation "${key}" (${lng})`);
            }
          : undefined,
      }),
    // The instance is created once; language changes go through changeLanguage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (initialLocale) {
      return;
    }
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (stored) => {
        if (isSupportedLocale(stored) && stored !== i18n.language) {
          await i18n.changeLanguage(stored);
          setLocaleState(stored);
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, [i18n, initialLocale]);

  const setLocale = useCallback(
    async (next: Locale) => {
      await i18n.changeLanguage(next);
      setLocaleState(next);
      await AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
    },
    [i18n],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, formatLocale: formattingLocale(locale, deviceTags), setLocale, ready }),
    [locale, deviceTags, setLocale, ready],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    </I18nextProvider>
  );
}

export function useLocaleSettings(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error('useLocaleSettings must be used inside I18nProvider');
  }
  return value;
}
