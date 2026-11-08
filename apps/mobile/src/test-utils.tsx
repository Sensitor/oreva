import type { Locale } from '@oreva/i18n';
import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from '@/data/DataProvider';
import { createDemoRepositories } from '@/data/demoRepositories';
import { I18nProvider } from '@/i18n/I18nProvider';
import {
  DEFAULT_PROTOTYPE_STATE,
  PrototypeStoreProvider,
  type PrototypeState,
} from '@/prototype/PrototypeStore';
import { ThemeProvider } from '@/theme/ThemeProvider';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Fixed "now" for tests: Saturday 14 November 2026, 09:30 in Monaco. */
export const TEST_NOW = new Date('2026-11-14T08:30:00Z');

/** Renders a screen with the app providers in a given language (async in RNTL 14). */
export function renderWithProviders(
  ui: ReactElement,
  locale: Locale = 'en',
  options: { prototype?: Partial<PrototypeState> } = {},
) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <I18nProvider initialLocale={locale}>
        <ThemeProvider>
          <DataProvider
            repositories={createDemoRepositories(TEST_NOW)}
            // No garbage-collection timers, so Jest exits cleanly.
            queryClient={
              new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } })
            }
          >
            <PrototypeStoreProvider
              initialState={{ ...DEFAULT_PROTOTYPE_STATE, ...options.prototype }}
            >
              {ui}
            </PrototypeStoreProvider>
          </DataProvider>
        </ThemeProvider>
      </I18nProvider>
    </SafeAreaProvider>,
  );
}
