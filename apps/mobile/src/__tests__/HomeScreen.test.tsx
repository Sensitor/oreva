import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import type * as ExpoRouter from 'expo-router';
import { router } from 'expo-router';
import { HomeScreen } from '@/features/home/HomeScreen';
import { renderWithProviders, TEST_NOW } from '@/test-utils';

jest.mock('expo-router', () => {
  const actual = jest.requireActual<typeof ExpoRouter>('expo-router');
  return {
    ...actual,
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  };
});

describe('Home', () => {
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
    jest.clearAllMocks();
  });

  it.each([
    ['en', 'Welcome to your Pilates moment', 'Classes to discover', 'Beginner foundations'],
    ['fr', 'Bienvenue dans votre moment Pilates', 'Cours à découvrir', 'Fondamentaux débutante'],
    ['ru', 'Ваше время для пилатеса', 'Занятия для открытия', 'Основы для начинающих'],
  ] as const)('renders fully translated in %s', async (locale, headline, nearby, program) => {
    await renderWithProviders(<HomeScreen now={TEST_NOW} />, locale);
    expect(await screen.findByText(headline)).toBeTruthy();
    expect(screen.getByText(nearby)).toBeTruthy();
    expect((await screen.findAllByText(program)).length).toBeGreaterThan(0);
  });

  it('starts today’s session from the Today card', async () => {
    await renderWithProviders(<HomeScreen now={TEST_NOW} />);
    await fireEvent.press(await screen.findByRole('button', { name: "Start today's session" }));
    expect(router.push).toHaveBeenCalledWith('/workouts/wk-morning-reset');
  });

  it('shows classes from the instructors and studios the member follows', async () => {
    await renderWithProviders(<HomeScreen now={TEST_NOW} />);
    expect(await screen.findByText('From your instructors and studios')).toBeTruthy();
  });

  it('labels demo content as sample data', async () => {
    await renderWithProviders(<HomeScreen now={TEST_NOW} />);
    await screen.findByText('Classes to discover');
    expect((await screen.findAllByText('Sample data')).length).toBeGreaterThan(3);
  });

  it('filters recommended sessions by category, with the selection announced', async () => {
    await renderWithProviders(<HomeScreen now={TEST_NOW} />);
    const core = await screen.findByRole('button', { name: 'Core' });
    expect(core).not.toBeSelected();
    await fireEvent.press(core);
    expect(screen.getByRole('button', { name: 'Core' })).toBeSelected();
    expect(await screen.findByText('Core foundations')).toBeTruthy();
    expect(screen.queryByText('Travel stretch')).toBeNull();
  });
});
