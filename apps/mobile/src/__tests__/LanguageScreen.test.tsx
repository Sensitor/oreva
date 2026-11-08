import { describe, expect, it } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { LanguageScreen } from '@/features/profile/LanguageScreen';
import { renderWithProviders } from '@/test-utils';

describe('Language picker', () => {
  it('switches the whole interface live and remembers the choice', async () => {
    await renderWithProviders(<LanguageScreen />, 'en');
    expect(screen.getByText('Language')).toBeTruthy();
    expect(screen.getByTestId('language-en')).toBeChecked();

    await fireEvent.press(screen.getByTestId('language-ru'));

    expect(await screen.findByText('Язык')).toBeTruthy();
    expect(screen.getByTestId('language-ru')).toBeChecked();
    await waitFor(async () => expect(await AsyncStorage.getItem('oreva.locale')).toBe('ru'));
  });

  it('lists each language in its own name', async () => {
    await renderWithProviders(<LanguageScreen />, 'fr');
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('Français')).toBeTruthy();
    expect(screen.getByText('Русский')).toBeTruthy();
  });
});
