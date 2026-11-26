import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { MapPoint } from '@oreva/core';
import { fireEvent, screen, within } from '@testing-library/react-native';
import type * as ExpoRouter from 'expo-router';
import { router } from 'expo-router';
import type * as ReactNative from 'react-native';
import { ClassDetailScreen } from '@/features/discover/ClassDetailScreen';
import { DiscoverScreen } from '@/features/discover/DiscoverScreen';
import { InstructorScreen } from '@/features/discover/InstructorScreen';
import type { DiscoverMapProps } from '@/features/discover/map/types';
import { OrganizationScreen } from '@/features/discover/OrganizationScreen';
import { dropCap } from '@/features/discover/PartnerParts';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { renderWithProviders } from '@/test-utils';

jest.mock('@/theme/useReduceMotion', () => ({ useReduceMotion: jest.fn(() => false) }));
jest.mock('@/features/discover/map/DiscoverMap', () => ({
  mapboxConfigured: true,
  DiscoverMap: (props: DiscoverMapProps) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text } = require('react-native') as typeof ReactNative;
    return (
      <>
        {props.points.map((point: MapPoint) => (
          <Pressable
            key={point.id}
            accessibilityLabel={props.labels.point(point)}
            onPress={() => props.onSelectPoint(point)}
            testID={`map-${point.venueId}`}
          >
            <Text>{point.venueId}</Text>
          </Pressable>
        ))}
      </>
    );
  },
}));
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

describe('Partner heroes', () => {
  it('take the initial of the name as a drop cap, past an article', () => {
    expect(dropCap('Atelier Rivage')).toBe('A');
    expect(dropCap("L'Atelier")).toBe('A');
    expect(dropCap('Léa M.')).toBe('L');
    expect(dropCap('Матины')).toBe('М');
  });

  it('studio page: a decorative panel, never a photograph, Follow over it', async () => {
    await renderWithProviders(<OrganizationScreen id="org-velours-paris" />, 'en', {
      prototype: { followedOrganizations: [] },
    });
    const cover = await screen.findByTestId('organization-cover');
    // No image anywhere in the panel (C-8): the letter is hidden from VoiceOver.
    expect(cover).toBeTruthy();
    // No image anywhere on a partner's page (C-8): the panel is type on a tint.
    expect(JSON.stringify(screen.toJSON())).not.toMatch(/ExpoImage/);
    const follow = screen.getByTestId('follow-org-velours-paris');
    await fireEvent.press(follow);
    expect(screen.getByTestId('follow-org-velours-paris')).toBeSelected();
    expect(screen.getByRole('button', { name: /^Stop following/ })).toBeTruthy();
  });

  it('renders the same with Reduce Motion on', async () => {
    jest.mocked(useReduceMotion).mockReturnValue(true);
    await renderWithProviders(<InstructorScreen id="ins-lea" />);
    expect(await screen.findByRole('header', { name: 'Léa M.' })).toBeTruthy();
    expect(screen.getByTestId('instructor-cover')).toBeTruthy();
  });

  it('has a spoken back button', async () => {
    await renderWithProviders(<InstructorScreen id="ins-lea" />);
    await screen.findByTestId('instructor-facts');
    expect(screen.getByTestId('detail-back').props.accessibilityLabel).toBe('Back');
    await fireEvent.press(screen.getByTestId('detail-back'));
    expect(router.back).toHaveBeenCalled();
  });
});

describe('Class page, editorial direction', () => {
  it('opens on the time, read as one sentence with the local time and length', async () => {
    await renderWithProviders(<ClassDetailScreen id="cls-1" />);
    const hero = await screen.findByTestId('class-ticket');
    const when = within(hero).getByLabelText(
      /^When, .*, Times are shown in local time in Monaco\., \d+ min$/,
    );
    expect(when).toBeTruthy();
    expect(screen.getByTestId('class-facts')).toBeTruthy();
    expect(screen.getByLabelText(/^Price, /)).toBeTruthy();
  });

  it('leads to the instructor and the studio', async () => {
    await renderWithProviders(<ClassDetailScreen id="cls-1" />);
    await fireEvent.press(await screen.findByTestId('class-instructor'));
    expect(router.push).toHaveBeenCalledWith(expect.stringMatching(/^\/instructors\//));
    await fireEvent.press(screen.getByTestId('class-studio'));
    expect(router.push).toHaveBeenCalledWith(expect.stringMatching(/^\/organizations\//));
  });
});

describe('Discover map, editorial direction', () => {
  it('names the area above the count, and "Everywhere" once the city is cleared', async () => {
    await renderWithProviders(<DiscoverScreen />);
    await screen.findByTestId('map-ven-larvotto');
    await fireEvent.press(screen.getByTestId('clear-area'));
    expect(await screen.findByText('Everywhere')).toBeTruthy();
  });

  it('preview: a monogram, the next class with its time, and the profile', async () => {
    await renderWithProviders(<DiscoverScreen />);
    await fireEvent.press(await screen.findByTestId('map-ven-larvotto'));
    const preview = await screen.findByTestId('point-preview');
    const next = within(preview).getByTestId('preview-next-class');
    expect(String(next.props.accessibilityLabel)).toMatch(/\d{1,2}[:.h]\d{2}/);
    await fireEvent.press(next);
    expect(router.push).toHaveBeenCalledWith(expect.stringMatching(/^\/classes\//));
    await fireEvent.press(within(preview).getByRole('button', { name: 'Close' }));
    expect(screen.queryByTestId('point-preview')).toBeNull();
  });
});
