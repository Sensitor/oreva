import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen } from '@testing-library/react-native';
import type * as ExpoRouter from 'expo-router';
import { router } from 'expo-router';
import { formatTimer, sessionPosition, startOfExercise } from '@/features/practice/session';
import { PlayerScreen } from '@/features/practice/PlayerScreen';
import { PracticeScreen } from '@/features/practice/PracticeScreen';
import { ProgramScreen } from '@/features/practice/ProgramScreen';
import { WorkoutScreen } from '@/features/practice/WorkoutScreen';
import { renderWithProviders } from '@/test-utils';

jest.mock('expo-router', () => {
  const actual = jest.requireActual<typeof ExpoRouter>('expo-router');
  return {
    ...actual,
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  };
});

describe('session timing', () => {
  const exercises = [{ durationSec: 60 }, { durationSec: 30 }, { durationSec: 30 }];

  it('finds the current exercise and remaining time', () => {
    expect(sessionPosition(exercises, 0)).toMatchObject({
      index: 0,
      exerciseRemaining: 60,
      progress: 0,
      finished: false,
    });
    expect(sessionPosition(exercises, 75)).toMatchObject({
      index: 1,
      exerciseElapsed: 15,
      exerciseRemaining: 15,
    });
    expect(sessionPosition(exercises, 120)).toMatchObject({ finished: true, progress: 1 });
    expect(sessionPosition(exercises, -5).index).toBe(0);
  });

  it('jumps to exercise starts and formats timers', () => {
    expect(startOfExercise(exercises, 2)).toBe(90);
    expect(formatTimer(50)).toBe('00:50');
    expect(formatTimer(125)).toBe('02:05');
  });
});

describe('Practice screens', () => {
  let warn: ReturnType<typeof jest.spyOn>;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    expect(warn.mock.calls.filter((args: unknown[]) => String(args[0]).includes('[i18n]'))).toEqual(
      [],
    );
    warn.mockRestore();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it.each([
    ['en', 'Beginner foundations', 'Morning reset'],
    ['fr', 'Fondamentaux débutante', 'Réveil en douceur'],
    ['ru', 'Основы для начинающих', 'Мягкое утро'],
  ] as const)('lists programs and sessions in %s', async (locale, program, workout) => {
    await renderWithProviders(<PracticeScreen />, locale);
    expect(await screen.findByText(program)).toBeTruthy();
    expect(screen.getByText(workout)).toBeTruthy();
  });

  it('filters the library by focus', async () => {
    await renderWithProviders(<PracticeScreen />);
    await screen.findByText('Morning reset');
    await fireEvent.press(screen.getByTestId('focus-core'));
    expect(await screen.findByText('Core foundations')).toBeTruthy();
    expect(screen.queryByText('Morning reset')).toBeNull();
  });

  it('shows a program day by day, with rest days', async () => {
    await renderWithProviders(<ProgramScreen id="pg-foundations" />);
    expect(await screen.findByTestId('program-day-1')).toBeTruthy();
    expect(screen.getAllByText('Rest day').length).toBe(2);
  });

  it('session page: tiles without calories, exercise list, start button', async () => {
    await renderWithProviders(<WorkoutScreen id="wk-core-foundations" />);
    expect(await screen.findByText('Core foundations')).toBeTruthy();
    expect(screen.getByText('Shoulder bridge')).toBeTruthy();
    expect(screen.queryByText(/kcal|calorie/i)).toBeNull();
    await fireEvent.press(screen.getByTestId('start-workout'));
    expect(router.push).toHaveBeenCalledWith('/player/wk-core-foundations');
  });

  it('player counts down, moves between exercises and saves progress', async () => {
    jest.useFakeTimers();
    await renderWithProviders(<PlayerScreen id="wk-morning-reset" />);
    expect(await screen.findByTestId('player-timer')).toHaveTextContent('01:00');
    expect(screen.getByText('Exercise 1 of 5')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('player-toggle'));
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId('player-timer')).toHaveTextContent('00:57');
    await fireEvent.press(screen.getByTestId('player-next'));
    expect(screen.getByText('Exercise 2 of 5')).toBeTruthy();
    expect(screen.getByText('Sample video')).toBeTruthy();
  });

  it('finishes the session and shows the completion screen', async () => {
    jest.useFakeTimers();
    // Start 3 seconds before the end of the 230-second session.
    await renderWithProviders(<PlayerScreen id="wk-morning-reset" />, 'fr', {
      prototype: { workoutProgress: { 'wk-morning-reset': 227 } },
    });
    await fireEvent.press(await screen.findByTestId('player-toggle'));
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    expect(await screen.findByText('Séance terminée')).toBeTruthy();
    expect(screen.getByTestId('player-done')).toBeTruthy();
  });

  it('resumes where the member stopped', async () => {
    await renderWithProviders(<PlayerScreen id="wk-morning-reset" />, 'en', {
      prototype: { workoutProgress: { 'wk-morning-reset': 70 } },
    });
    expect(await screen.findByText('Exercise 2 of 5')).toBeTruthy();
    expect(screen.getByTestId('player-timer')).toHaveTextContent('00:30');
  });
});
