import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import type * as ExpoRouter from 'expo-router';
import { router } from 'expo-router';
import { CircleScreen } from '@/features/connect/CircleScreen';
import { ConnectScreen } from '@/features/connect/ConnectScreen';
import { renderWithProviders } from '@/test-utils';

jest.mock('expo-router', () => {
  const actual = jest.requireActual<typeof ExpoRouter>('expo-router');
  return {
    ...actual,
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  };
});

describe('Connect', () => {
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
  });

  it.each([
    ['en', '5 members'],
    ['fr', '5 membres'],
    ['ru', '5 участниц'],
  ] as const)('lists Circles and followed profiles in %s', async (locale, members) => {
    await renderWithProviders(<ConnectScreen />, locale);
    expect(await screen.findByText('Morning crew')).toBeTruthy();
    expect(screen.getByText(new RegExp(members))).toBeTruthy();
    expect(await screen.findByText('Léa M.')).toBeTruthy();
    expect(screen.getByText('Atelier Rivage')).toBeTruthy();
  });

  it('creates a Circle on this phone and opens it', async () => {
    await renderWithProviders(<ConnectScreen />);
    await fireEvent.press(await screen.findByTestId('create-circle'));
    expect(screen.getByTestId('confirm-create-circle')).toBeDisabled();
    await fireEvent.changeText(screen.getByTestId('circle-name-input'), 'Saturday crew');
    await fireEvent.press(screen.getByTestId('confirm-create-circle'));
    expect(router.push).toHaveBeenCalledWith(expect.stringMatching(/^\/circles\/local-/));
    expect(await screen.findByText('Saturday crew')).toBeTruthy();
  });

  it('shows the challenge, hiding activity that is not shared', async () => {
    await renderWithProviders(<CircleScreen id="circle-morning-crew" />);
    expect(await screen.findByText('8 sessions in 4 weeks')).toBeTruthy();
    expect(screen.getByText('Activity not shared')).toBeTruthy();
    expect(screen.getByText('4 of 8 sessions')).toBeTruthy();
  });

  it('keeps messages in their original language and shows shared classes', async () => {
    await renderWithProviders(<CircleScreen id="circle-morning-crew" />, 'ru');
    expect(await screen.findByText('Qui vient au cours du lever du soleil demain ?')).toBeTruthy();
    expect(screen.getByTestId('shared-class')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('shared-class'));
    expect(router.push).toHaveBeenCalledWith('/classes/cls-1');
  });

  it('sends a message (stored on this phone in the prototype)', async () => {
    await renderWithProviders(<CircleScreen id="circle-weekend-riviera" />);
    await screen.findByText('Hello! Happy to be here.');
    expect(screen.getByTestId('send-message')).toBeDisabled();
    await fireEvent.changeText(screen.getByTestId('message-input'), 'See you on Saturday');
    await fireEvent.press(screen.getByTestId('send-message'));
    expect(await screen.findByText('See you on Saturday')).toBeTruthy();
  });
});
