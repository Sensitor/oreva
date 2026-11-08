import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { PillTabBar } from '@/ui';
import { useFontScale } from '@/theme/useFontScale';
import { renderWithProviders } from '@/test-utils';

jest.mock('@/theme/useFontScale', () => ({ useFontScale: jest.fn(() => 1) }));

const ROUTES = ['index', 'discover', 'practice', 'connect', 'profile'];
const TITLES = ['Home', 'Discover', 'Practice', 'Connect', 'Profile'];

function makeProps(activeIndex: number) {
  const emit = jest.fn((_event: unknown) => ({ defaultPrevented: false }));
  const navigateToTab = jest.fn((_key: string) => undefined);
  const props = {
    state: { index: activeIndex, routes: ROUTES.map((name) => ({ key: `${name}-key`, name })) },
    descriptors: Object.fromEntries(
      ROUTES.map((name, i) => [`${name}-key`, { options: { title: TITLES[i] } }]),
    ),
    emitter: { emit },
    navigateToTab,
    insets: { top: 0, bottom: 34, left: 0, right: 0 },
  } as unknown as BottomTabBarProps;
  return { props, emit, navigateToTab };
}

function setFontScale(fontScale: number) {
  jest.mocked(useFontScale).mockReturnValue(fontScale);
}

describe('PillTabBar', () => {
  beforeEach(() => {
    setFontScale(1);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('gives every tab a spoken label and marks the active one', async () => {
    const { props } = makeProps(1);
    await renderWithProviders(<PillTabBar {...props} />);
    for (const title of TITLES) {
      expect(screen.getByRole('tab', { name: title })).toBeTruthy();
    }
    expect(screen.getByRole('tab', { name: 'Discover' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Home' })).not.toBeSelected();
  });

  it('shows only the active label at normal text size', async () => {
    const { props } = makeProps(0);
    await renderWithProviders(<PillTabBar {...props} />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.queryByText('Profile')).toBeNull();
  });

  it('shows every label when the member uses large text', async () => {
    setFontScale(1.5);
    const { props } = makeProps(0);
    await renderWithProviders(<PillTabBar {...props} />);
    for (const title of TITLES) {
      expect(screen.getByText(title)).toBeTruthy();
    }
  });

  it('navigates when another tab is pressed', async () => {
    const { props, emit, navigateToTab } = makeProps(0);
    await renderWithProviders(<PillTabBar {...props} />);
    await fireEvent.press(screen.getByRole('tab', { name: 'Profile' }));
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'profile-key' }),
    );
    expect(navigateToTab).toHaveBeenCalledWith('profile-key');
  });

  it('does not navigate when the active tab is pressed again', async () => {
    const { props, navigateToTab } = makeProps(0);
    await renderWithProviders(<PillTabBar {...props} />);
    await fireEvent.press(screen.getByRole('tab', { name: 'Home' }));
    expect(navigateToTab).not.toHaveBeenCalled();
  });
});
