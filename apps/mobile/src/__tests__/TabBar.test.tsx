import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import * as Haptics from 'expo-haptics';
import { TabBar } from '@/ui';
import { renderWithProviders } from '@/test-utils';

const ROUTES = ['index', 'discover', 'practice', 'connect', 'profile'];
const TITLES = ['Today', 'Discover', 'Practice', 'Connect', 'Profile'];

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

describe('TabBar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('gives every tab a spoken label and marks the active one', async () => {
    const { props } = makeProps(1);
    await renderWithProviders(<TabBar {...props} />);
    for (const title of TITLES) {
      expect(screen.getByRole('tab', { name: title })).toBeTruthy();
    }
    expect(screen.getByRole('tab', { name: 'Discover' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Today' })).not.toBeSelected();
  });

  it('shows a label on every tab, kept on one line at large text sizes', async () => {
    const { props } = makeProps(0);
    await renderWithProviders(<TabBar {...props} />);
    for (const title of TITLES) {
      const label = screen.getByText(title);
      expect(label.props.numberOfLines).toBe(1);
      expect(label.props.maxFontSizeMultiplier).toBe(1.3);
    }
  });

  it('uses the ORÉVA icons and marks the active tab with the signature line', async () => {
    const { props } = makeProps(2);
    await renderWithProviders(<TabBar {...props} />);
    for (const name of ['today', 'discover', 'practice', 'connect', 'profile']) {
      expect(screen.getByTestId(`icon-${name}`, { includeHiddenElements: true })).toBeTruthy();
    }
    // Icons and the line are decorative: hidden from screen readers.
    expect(screen.getAllByTestId('tab-line', { includeHiddenElements: true })).toHaveLength(1);
    expect(screen.queryByTestId('tab-line')).toBeNull();
  });

  it('navigates when another tab is pressed', async () => {
    const { props, emit, navigateToTab } = makeProps(0);
    await renderWithProviders(<TabBar {...props} />);
    await fireEvent.press(screen.getByRole('tab', { name: 'Profile' }));
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'profile-key' }),
    );
    expect(navigateToTab).toHaveBeenCalledWith('profile-key');
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('does not navigate when the active tab is pressed again', async () => {
    const { props, navigateToTab } = makeProps(0);
    await renderWithProviders(<TabBar {...props} />);
    await fireEvent.press(screen.getByRole('tab', { name: 'Today' }));
    expect(navigateToTab).not.toHaveBeenCalled();
  });
});
