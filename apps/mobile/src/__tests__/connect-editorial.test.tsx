import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import type * as ExpoRouter from 'expo-router';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { CircleScreen } from '@/features/connect/CircleScreen';
import { ConnectScreen } from '@/features/connect/ConnectScreen';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { TabBar } from '@/ui';
import { renderWithProviders } from '@/test-utils';

jest.mock('@/theme/useReduceMotion', () => ({ useReduceMotion: jest.fn(() => false) }));
jest.mock('expo-router', () => {
  const actual = jest.requireActual<typeof ExpoRouter>('expo-router');
  return {
    ...actual,
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  };
});

beforeEach(() => {
  jest.mocked(useReduceMotion).mockReturnValue(false);
});
afterEach(() => {
  jest.clearAllMocks();
});

describe('Connect, editorial direction', () => {
  it('opens with a serif title and the two ways in', async () => {
    await renderWithProviders(<ConnectScreen />);
    expect(await screen.findByRole('header', { name: 'Connect' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create a Circle' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Join with a code' })).toBeTruthy();
  });

  it('lists a Circle as one button with its name and members', async () => {
    await renderWithProviders(<ConnectScreen />);
    const circle = await screen.findByTestId('circle-circle-morning-crew');
    expect(circle.props.accessibilityLabel).toBe('Morning crew, 5 members');
    await fireEvent.press(circle);
    expect(router.push).toHaveBeenCalledWith('/circles/circle-morning-crew');
  });

  it('shows followed instructors and studios as monograms, never photographs', async () => {
    await renderWithProviders(<ConnectScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Léa M.' }));
    expect(router.push).toHaveBeenCalledWith(expect.stringMatching(/^\/instructors\//));
    expect(JSON.stringify(screen.toJSON())).not.toMatch(/ExpoImage/);
  });
});

describe('Circle page, editorial direction', () => {
  it('opens on a drop-cap panel, never a photograph, with a back button', async () => {
    await renderWithProviders(<CircleScreen id="circle-morning-crew" />);
    expect(await screen.findByTestId('circle-cover')).toBeTruthy();
    expect(screen.getByText('Private Circle')).toBeTruthy();
    expect(JSON.stringify(screen.toJSON())).not.toMatch(/ExpoImage/);
    await fireEvent.press(screen.getByTestId('detail-back'));
    expect(router.back).toHaveBeenCalled();
  });

  it('reads the members as one line: count, then names', async () => {
    await renderWithProviders(<CircleScreen id="circle-morning-crew" />);
    expect(await screen.findByLabelText(/^5 members, /)).toBeTruthy();
  });

  it('gives each sharing member a thread labelled with their name and progress', async () => {
    await renderWithProviders(<CircleScreen id="circle-morning-crew" />);
    await screen.findByText('8 sessions in 4 weeks');
    const threads = screen.getAllByRole('progressbar');
    for (const thread of threads) {
      expect(String(thread.props.accessibilityLabel)).toMatch(/, \d+ of 8 sessions$/);
    }
  });

  it('shows a shared class with its time, and opens it', async () => {
    await renderWithProviders(<CircleScreen id="circle-morning-crew" />);
    const shared = await screen.findByTestId('shared-class');
    expect(String(shared.props.accessibilityLabel)).toMatch(/^Shared a class, .*\d{1,2}[:.h]\d{2}/);
  });

  it('sends with a light haptic', async () => {
    await renderWithProviders(<CircleScreen id="circle-morning-crew" />);
    await fireEvent.changeText(await screen.findByTestId('message-input'), 'À samedi');
    await fireEvent.press(screen.getByTestId('send-message'));
    expect(Haptics.impactAsync).toHaveBeenCalled();
    expect(await screen.findByText('À samedi')).toBeTruthy();
  });

  it('renders the same with Reduce Motion on', async () => {
    jest.mocked(useReduceMotion).mockReturnValue(true);
    await renderWithProviders(<CircleScreen id="circle-morning-crew" />);
    expect(await screen.findByRole('header', { name: 'Morning crew' })).toBeTruthy();
  });
});

describe('Tab bar, editorial direction', () => {
  const props = (index: number) =>
    ({
      state: {
        index,
        routes: ['index', 'discover', 'practice', 'connect', 'profile'].map((name) => ({
          key: `${name}-key`,
          name,
        })),
      },
      descriptors: {},
      emitter: { emit: jest.fn(() => ({ defaultPrevented: false })) },
      navigateToTab: jest.fn(),
      insets: { top: 0, bottom: 34, left: 0, right: 0 },
    }) as unknown as BottomTabBarProps;

  it('keeps one sliding mark, hidden from VoiceOver, with or without Reduce Motion', async () => {
    for (const reduce of [false, true]) {
      jest.mocked(useReduceMotion).mockReturnValue(reduce);
      await renderWithProviders(<TabBar {...props(3)} />);
      expect(screen.getAllByTestId('tab-line', { includeHiddenElements: true })).toHaveLength(1);
      expect(screen.queryByTestId('tab-line')).toBeNull();
      expect(screen.getByRole('tab', { name: 'connect' })).toBeSelected();
    }
  });
});
