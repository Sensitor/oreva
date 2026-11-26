import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen } from '@testing-library/react-native';
import type * as ExpoRouter from 'expo-router';
import { router } from 'expo-router';
import { demoPrograms } from '@oreva/demo-data';
import { PlayerScreen } from '@/features/practice/PlayerScreen';
import { PracticeScreen } from '@/features/practice/PracticeScreen';
import { ProgramScreen } from '@/features/practice/ProgramScreen';
import { programProgress } from '@/features/practice/programProgress';
import { WorkoutScreen } from '@/features/practice/WorkoutScreen';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { renderWithProviders, TEST_NOW } from '@/test-utils';

jest.mock('@/theme/useReduceMotion', () => ({ useReduceMotion: jest.fn(() => false) }));
jest.mock('expo-router', () => {
  const actual = jest.requireActual<typeof ExpoRouter>('expo-router');
  return {
    ...actual,
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  };
});

const foundations = demoPrograms.find((p) => p.id === 'pg-foundations');
const finished = (workoutId: string) => ({ workoutId, completedAt: TEST_NOW.toISOString() });

beforeEach(() => {
  jest.mocked(useReduceMotion).mockReturnValue(false);
});
afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('program progress', () => {
  it('counts each finished session for one day only, in order', () => {
    if (!foundations) throw new Error('missing demo program');
    const repeated = foundations.days.filter((d) => d.workoutId === 'wk-morning-reset');
    expect(repeated.length).toBeGreaterThan(1);

    const once = programProgress(foundations, ['wk-morning-reset']);
    expect(once.doneDays).toBe(1);
    expect([...once.doneDayNumbers]).toEqual([repeated[0]?.day]);

    const twice = programProgress(foundations, ['wk-morning-reset', 'wk-morning-reset']);
    expect(twice.doneDays).toBe(2);
  });

  it('starts empty and points at the first session', () => {
    if (!foundations) throw new Error('missing demo program');
    const none = programProgress(foundations, []);
    expect(none.value).toBe(0);
    expect(none.nextDay?.day).toBe(foundations.days.find((d) => d.workoutId)?.day);
  });
});

describe('Practice, editorial direction', () => {
  it('shows programs as chapters with their real progress', async () => {
    await renderWithProviders(<PracticeScreen />, 'en', {
      prototype: { completedWorkouts: [finished('wk-morning-reset')] },
    });
    const card = await screen.findByTestId('program-card-pg-foundations');
    expect(card.props.accessibilityLabel).toMatch(
      /Beginner foundations, 4 weeks, Beginner, 1 of 5 sessions/,
    );
    expect(screen.getAllByRole('progressbar', { name: 'Program progress' }).length).toBe(
      demoPrograms.length,
    );
  });

  it('announces the views as tabs with their selected state', async () => {
    await renderWithProviders(<PracticeScreen />);
    const programs = await screen.findByRole('tab', { name: 'Programs' });
    expect(programs).toBeSelected();
    await fireEvent.press(screen.getByRole('tab', { name: 'Sessions' }));
    expect(screen.getByRole('tab', { name: 'Sessions' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Programs' })).not.toBeSelected();
  });

  it('offers to clear filters when nothing matches', async () => {
    await renderWithProviders(<PracticeScreen />);
    await fireEvent.press(await screen.findByTestId('practice-view-sessions'));
    // Core Foundations is the only core session, and it is for beginners.
    await fireEvent.press(screen.getByTestId('focus-core'));
    await fireEvent.press(screen.getByText('Intermediate'));
    expect(await screen.findByText('No sessions match these filters.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('practice-reset-filters'));
    expect(await screen.findByText('Morning reset')).toBeTruthy();
  });

  it('program page: continue at the next day, the path marks only what was done', async () => {
    await renderWithProviders(<ProgramScreen id="pg-foundations" />, 'en', {
      prototype: { completedWorkouts: [finished('wk-morning-reset')] },
    });
    const start = await screen.findByTestId('program-start');
    expect(screen.getByText('1 of 5 sessions')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Day 1, Morning reset, Completed/ })).toBeTruthy();
    // Day 7 repeats Morning reset: not done until it is finished a second time.
    expect(screen.getByRole('button', { name: /^Day 7, Morning reset$/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Day 2, .*Up next/ })).toBeTruthy();
    await fireEvent.press(start);
    expect(router.push).toHaveBeenCalledWith(expect.stringMatching(/^\/workouts\//));
  });

  it('program page starts the program before any session', async () => {
    await renderWithProviders(<ProgramScreen id="pg-foundations" />);
    expect(await screen.findByText('Start the program')).toBeTruthy();
    expect(screen.queryByText(/Up next/)).toBeNull();
  });

  it('detail pages have a spoken back button and a decorative photograph', async () => {
    await renderWithProviders(<WorkoutScreen id="wk-core-foundations" />);
    await screen.findByTestId('workout-facts');
    await fireEvent.press(screen.getByTestId('detail-back'));
    expect(screen.getByTestId('detail-back').props.accessibilityLabel).toBe('Back');
    expect(router.back).toHaveBeenCalled();
    // The photograph is a frame with no label; the image inside is hidden from VoiceOver.
    const cover = screen.getByTestId('workout-cover');
    expect(cover.props.accessibilityLabel).toBeUndefined();
    expect(cover.props.accessible).not.toBe(true);
  });

  it('session page offers Resume when a session was left halfway', async () => {
    await renderWithProviders(<WorkoutScreen id="wk-morning-reset" />, 'en', {
      prototype: { workoutProgress: { 'wk-morning-reset': 70 } },
    });
    expect(await screen.findByText('Resume')).toBeTruthy();
  });
});

describe('Player, editorial direction', () => {
  it('has a spoken close button and a session progress line', async () => {
    await renderWithProviders(<PlayerScreen id="wk-morning-reset" />, 'en', {
      prototype: { workoutProgress: { 'wk-morning-reset': 70 } },
    });
    const bar = await screen.findByRole('progressbar', { name: 'Session progress' });
    expect(bar.props.accessibilityValue.now).toBe(Math.round((70 / 230) * 100));
    await fireEvent.press(screen.getByRole('button', { name: 'Close the player' }));
    expect(router.back).toHaveBeenCalled();
  });

  it('shows the next exercise, and nothing after the last one', async () => {
    await renderWithProviders(<PlayerScreen id="wk-morning-reset" />);
    expect(await screen.findByText('Up next: Cat and cow')).toBeTruthy();
    for (let i = 0; i < 4; i += 1) {
      await fireEvent.press(screen.getByTestId('player-next'));
    }
    expect(screen.getByText('Exercise 5 of 5')).toBeTruthy();
    expect(screen.queryByText(/Up next/)).toBeNull();
  });

  it.each([false, true])(
    'completion shows the real numbers and La Ligne (Reduce Motion %s)',
    async (reduce) => {
      jest.mocked(useReduceMotion).mockReturnValue(reduce);
      jest.useFakeTimers();
      await renderWithProviders(<PlayerScreen id="wk-morning-reset" />, 'en', {
        prototype: { workoutProgress: { 'wk-morning-reset': 229 } },
      });
      await fireEvent.press(await screen.findByTestId('player-toggle'));
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      expect(await screen.findByRole('header', { name: 'Bravo' })).toBeTruthy();
      expect(screen.getByLabelText('Exercises, 5')).toBeTruthy();
      expect(screen.getByLabelText('Minutes, 4')).toBeTruthy();
      // Decorative: present, hidden from VoiceOver.
      expect(
        screen.getByTestId('player-completion-mark', { includeHiddenElements: true }),
      ).toBeTruthy();
      expect(screen.getByTestId('player-signature', { includeHiddenElements: true })).toBeTruthy();
      await fireEvent.press(screen.getByTestId('player-done'));
      expect(router.back).toHaveBeenCalled();
    },
  );
});
