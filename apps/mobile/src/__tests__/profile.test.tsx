import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import type * as ExpoRouter from 'expo-router';
import { router } from 'expo-router';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { NotificationsScreen } from '@/features/settings/NotificationsScreen';
import { PrivacyScreen } from '@/features/settings/PrivacyScreen';
import { PrototypeScreen } from '@/features/settings/PrototypeScreen';
import { renderWithProviders } from '@/test-utils';

jest.mock('expo-router', () => {
  const actual = jest.requireActual<typeof ExpoRouter>('expo-router');
  return {
    ...actual,
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  };
});
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: false, canAskAgain: true })),
}));
jest.mock('@/features/discover/map/DiscoverMap', () => ({
  mapboxConfigured: false,
  DiscoverMap: () => null,
}));

describe('Profile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['en', 'Welcome to ORÉVA', '1 session this week'],
    ['fr', 'Bienvenue sur ORÉVA', '1 séance cette semaine'],
    ['ru', 'Добро пожаловать в ORÉVA', '1 занятие на этой неделе'],
  ] as const)('shows the guest card and practice summary in %s', async (locale, title, week) => {
    await renderWithProviders(<ProfileScreen />, locale, {
      prototype: {
        completedWorkouts: [
          { workoutId: 'wk-morning-reset', completedAt: new Date().toISOString() },
        ],
      },
    });
    expect(await screen.findByText(title)).toBeTruthy();
    expect(screen.getByText(week)).toBeTruthy();
  });

  it('opens settings screens', async () => {
    await renderWithProviders(<ProfileScreen />);
    await fireEvent.press(await screen.findByTestId('profile-privacy'));
    expect(router.push).toHaveBeenCalledWith('/settings/privacy');
    await fireEvent.press(screen.getByTestId('profile-prototype'));
    expect(router.push).toHaveBeenCalledWith('/settings/prototype');
  });

  it('keeps news notifications off by default (consent)', async () => {
    await renderWithProviders(<NotificationsScreen />);
    const news = await screen.findByTestId('toggle-news');
    expect(news.props.value).toBe(false);
    await fireEvent(news, 'valueChange', true);
    expect(screen.getByTestId('toggle-news').props.value).toBe(true);
  });

  it('lets the member turn off Mapbox telemetry (required by Mapbox terms)', async () => {
    await renderWithProviders(<PrivacyScreen />);
    const toggle = await screen.findByTestId('toggle-map-telemetry');
    expect(toggle.props.value).toBe(true);
    await fireEvent(toggle, 'valueChange', false);
    expect(screen.getByTestId('toggle-map-telemetry').props.value).toBe(false);
    expect(await screen.findByText('Not asked yet')).toBeTruthy();
  });

  it('switches the map provider for the A/B test and explains a missing Mapbox token', async () => {
    await renderWithProviders(<PrototypeScreen />);
    expect(await screen.findByText(/Mapbox token missing/)).toBeTruthy();
    expect(screen.getByTestId('provider-mapbox')).toBeSelected();
    await fireEvent.press(screen.getByTestId('provider-apple'));
    expect(screen.getByTestId('provider-apple')).toBeSelected();
  });
});
