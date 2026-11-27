import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import type * as ExpoRouter from 'expo-router';
import { router } from 'expo-router';
import { LanguageScreen } from '@/features/profile/LanguageScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { NotificationsScreen } from '@/features/settings/NotificationsScreen';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { WeekRings } from '@/ui/editorial';
import { renderWithProviders } from '@/test-utils';

jest.mock('@/theme/useReduceMotion', () => ({ useReduceMotion: jest.fn(() => false) }));
jest.mock('expo-router', () => {
  const actual = jest.requireActual<typeof ExpoRouter>('expo-router');
  return {
    ...actual,
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  };
});

const LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

beforeEach(() => {
  jest.mocked(useReduceMotion).mockReturnValue(false);
});
afterEach(() => {
  jest.clearAllMocks();
});

describe('The week as rings', () => {
  it.each([false, true])(
    'fills only the days with a finished session, rings today (Reduce Motion %s)',
    async (reduce) => {
      jest.mocked(useReduceMotion).mockReturnValue(reduce);
      await renderWithProviders(
        <WeekRings
          days={[true, false, true, false, false, false, false]}
          labels={LABELS}
          today={3}
          accessibilityLabel="2 sessions this week"
        />,
      );
      const count = (id: string) => screen.queryAllByTestId(id, { includeHiddenElements: true });
      expect(count('day-done')).toHaveLength(2);
      expect(count('day-today')).toHaveLength(1);
      expect(count('day-empty')).toHaveLength(4);
      expect(screen.getByLabelText('2 sessions this week')).toBeTruthy();
    },
  );

  it('is decorative when the count is said next to it', async () => {
    await renderWithProviders(
      <WeekRings
        days={[true, false, false, false, false, false, false]}
        labels={LABELS}
        today={0}
      />,
    );
    expect(screen.queryAllByTestId('day-done')).toHaveLength(0);
    expect(screen.queryAllByTestId('day-done', { includeHiddenElements: true })).toHaveLength(1);
  });

  it('does not ring today once a session filled it', async () => {
    await renderWithProviders(
      <WeekRings
        days={[false, false, false, true, false, false, false]}
        labels={LABELS}
        today={3}
        accessibilityLabel="1 session this week"
      />,
    );
    expect(screen.queryAllByTestId('day-today', { includeHiddenElements: true })).toHaveLength(0);
  });
});

describe('Profile, editorial direction', () => {
  it('opens with a serif title and the membership card, honest about accounts', async () => {
    await renderWithProviders(<ProfileScreen />);
    expect(await screen.findByRole('header', { name: 'Profile' })).toBeTruthy();
    expect(screen.getByTestId('guest-card')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create an account' })).toBeDisabled();
  });

  it('shows the real numbers from this phone', async () => {
    await renderWithProviders(<ProfileScreen />, 'en', {
      prototype: {
        completedWorkouts: [
          { workoutId: 'wk-morning-reset', completedAt: new Date().toISOString() },
          { workoutId: 'wk-core-foundations', completedAt: '2020-01-01T08:00:00.000Z' },
        ],
      },
    });
    // Said once, by the number: the week is decorative next to it.
    expect(await screen.findAllByLabelText('1 session this week')).toHaveLength(1);
    expect(screen.getByLabelText('2 sessions in total')).toBeTruthy();
  });

  it('reads Following as one button with its count, and opens Connect', async () => {
    await renderWithProviders(<ProfileScreen />, 'en', {
      prototype: { followedInstructors: ['ins-lea'], followedOrganizations: [] },
    });
    const row = await screen.findByTestId('profile-following');
    expect(row.props.accessibilityLabel).toBe('Following, 1');
    await fireEvent.press(row);
    expect(router.push).toHaveBeenCalledWith('/connect');
  });
});

describe('Settings and language, editorial direction', () => {
  it('a settings page has a serif title and a spoken back button', async () => {
    await renderWithProviders(<NotificationsScreen />);
    expect(await screen.findByRole('header', { name: 'Notifications' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(router.back).toHaveBeenCalled();
  });

  it('choosing another language gives a selection haptic; the same one does not', async () => {
    await renderWithProviders(<LanguageScreen />);
    await fireEvent.press(await screen.findByTestId('language-en'));
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId('language-fr'));
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });
});
