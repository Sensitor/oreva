import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { contrastPairs } from '@oreva/tokens';
import { screen, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { DesignPreviewScreen } from '@/features/design-preview/DesignPreviewScreen';
import { fontAssets } from '@/theme/fonts';
import { AppText } from '@/ui';
import { renderWithProviders } from '@/test-utils';

describe('Design system (phases A and B)', () => {
  let warn: ReturnType<typeof jest.spyOn>;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    // No translation may be missing in any language.
    expect(warn.mock.calls.filter((args: unknown[]) => String(args[0]).includes('[i18n]'))).toEqual(
      [],
    );
    warn.mockRestore();
  });

  it.each([
    ['en', 'Design system', 'Cream', 'Plum'],
    ['fr', 'Système de design', 'Crème', 'Prune'],
    ['ru', 'Дизайн-система', 'Кремовый', 'Сливовый'],
  ] as const)('shows the approved palette in %s', async (locale, title, cream, plum) => {
    await renderWithProviders(<DesignPreviewScreen />, locale);
    expect(await screen.findByText(title)).toBeTruthy();
    expect(screen.getByText(cream)).toBeTruthy();
    expect(within(screen.getByTestId('swatch-plum')).getByText(plum)).toBeTruthy();
    expect(screen.getAllByTestId(/^swatch-/)).toHaveLength(10);
    expect(screen.getByText('#4B365D')).toBeTruthy();
    expect(screen.getByText('#A78BC6')).toBeTruthy();
  });

  it.each([
    ['en', 'Components', 'Signatures', 'Program progress'],
    ['fr', 'Composants', 'Signatures', 'Progression du programme'],
    ['ru', 'Компоненты', 'Фирменные элементы', 'Прогресс программы'],
  ] as const)(
    'shows the components and signatures in %s',
    async (locale, components, signatures, progress) => {
      await renderWithProviders(<DesignPreviewScreen />, locale);
      expect(await screen.findByText(components)).toBeTruthy();
      expect(screen.getByText(signatures)).toBeTruthy();
      expect(screen.getByRole('progressbar', { name: progress })).toBeTruthy();
      expect(screen.getAllByTestId(/^voile-/)).toHaveLength(4);
      expect(
        screen.getAllByTestId(/^icon-/, { includeHiddenElements: true }).length,
      ).toBeGreaterThanOrEqual(12);
    },
  );

  it('confirms every color pairing passes AA', async () => {
    await renderWithProviders(<DesignPreviewScreen />);
    expect(
      await screen.findByText(
        `All ${String(contrastPairs.length)} color pairings used in the app pass WCAG AA.`,
      ),
    ).toBeTruthy();
  });

  it('shows type specimens in English, French and Russian, with no typeface switch', async () => {
    await renderWithProviders(<DesignPreviewScreen />);
    for (const code of ['en', 'fr', 'ru']) {
      expect(await screen.findByTestId(`specimen-${code}`)).toBeTruthy();
    }
    expect(screen.getByText('Ваше движение. Ваш момент.')).toBeTruthy();
    expect(screen.getByText('Votre mouvement. Votre moment.')).toBeTruthy();
    expect(screen.queryByText('Onest')).toBeNull();
  });
});

describe('AppText typefaces', () => {
  const familyOf = (testID: string) =>
    StyleSheet.flatten(screen.getByTestId(testID).props.style).fontFamily as string;

  it('sets titles and numerals in Cormorant Garamond and the interface in Manrope', async () => {
    await renderWithProviders(
      <>
        <AppText variant="display" testID="display">
          {'A'}
        </AppText>
        <AppText variant="numeral" testID="numeral">
          {'1'}
        </AppText>
        <AppText variant="body" testID="body">
          {'B'}
        </AppText>
        <AppText variant="kicker" testID="kicker">
          {'C'}
        </AppText>
      </>,
    );
    expect(familyOf('display')).toBe('CormorantGaramond_500Medium');
    expect(familyOf('numeral')).toBe('CormorantGaramond_500Medium');
    expect(familyOf('body')).toBe('Manrope_400Regular');
    expect(familyOf('kicker')).toBe('Manrope_600SemiBold');
    expect(StyleSheet.flatten(screen.getByTestId('kicker').props.style).textTransform).toBe(
      'uppercase',
    );
    // Class times and timers sit on the line: lining, tabular figures.
    expect(StyleSheet.flatten(screen.getByTestId('numeral').props.style).fontVariant).toEqual([
      'lining-nums',
      'tabular-nums',
    ]);
  });

  it('bundles exactly the fonts the type scale uses, and no Onest', () => {
    const names = Object.keys(fontAssets);
    expect(names).toContain('CormorantGaramond_600SemiBold');
    expect(names).toContain('Manrope_400Regular');
    expect(names.some((name) => name.startsWith('Onest'))).toBe(false);
  });
});
