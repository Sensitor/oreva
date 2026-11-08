import type { Locale } from '@oreva/i18n';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from '@/i18n/I18nProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Renders a screen with the app providers in a given language (async in RNTL 14). */
export function renderWithProviders(ui: ReactElement, locale: Locale = 'en') {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <I18nProvider initialLocale={locale}>
        <ThemeProvider>{ui}</ThemeProvider>
      </I18nProvider>
    </SafeAreaProvider>,
  );
}
