import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { MapPoint } from '@oreva/core';
import { fireEvent, screen, within } from '@testing-library/react-native';
import * as Location from 'expo-location';
import type * as ExpoRouter from 'expo-router';
import { router } from 'expo-router';
import { ClassDetailScreen } from '@/features/discover/ClassDetailScreen';
import { DiscoverScreen } from '@/features/discover/DiscoverScreen';
import { InstructorScreen } from '@/features/discover/InstructorScreen';
import type { DiscoverMapProps } from '@/features/discover/map/types';
import { OrganizationScreen } from '@/features/discover/OrganizationScreen';
import type * as ReactNative from 'react-native';
import { renderWithProviders } from '@/test-utils';

// The native map SDKs cannot run in Jest. This test double renders one button
// per map point and records the props it received.
const mockLastMapProps: { current: DiscoverMapProps | null } = { current: null };
jest.mock('@/features/discover/map/DiscoverMap', () => ({
  mapboxConfigured: true,
  DiscoverMap: (props: DiscoverMapProps) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text } = require('react-native') as typeof ReactNative;
    mockLastMapProps.current = props;
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
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => false },
  };
});

jest.mock('expo-location', () => ({
  Accuracy: { Low: 2 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const location = Location as jest.Mocked<typeof Location>;

describe('Discover', () => {
  let warn: ReturnType<typeof jest.spyOn>;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockLastMapProps.current = null;
  });
  afterEach(() => {
    expect(warn.mock.calls.filter((args: unknown[]) => String(args[0]).includes('[i18n]'))).toEqual(
      [],
    );
    warn.mockRestore();
    jest.clearAllMocks();
  });

  it.each([
    ['en', 'Monaco', 'Filters'],
    ['fr', 'Monaco', 'Filtres'],
    ['ru', 'Монако', 'Фильтры'],
  ] as const)('opens on Monaco in %s', async (locale, city, filters) => {
    await renderWithProviders(<DiscoverScreen />, locale);
    expect(await screen.findByText(city)).toBeTruthy();
    expect(screen.getByText(filters)).toBeTruthy();
  });

  it('shows every demo venue on the map, private ones as approximate areas only', async () => {
    await renderWithProviders(<DiscoverScreen />);
    await screen.findByTestId('map-ven-larvotto');
    const points = mockLastMapProps.current?.points ?? [];
    expect(points.length).toBe(15);
    const privatePoint = points.find((p) => p.venueId === 'ven-rivage-studio');
    expect(privatePoint?.approximateRadiusMeters).toBeGreaterThan(0);
  });

  it('runs the discovery journey: marker, preview, studio profile', async () => {
    await renderWithProviders(<DiscoverScreen />);
    await fireEvent.press(await screen.findByTestId('map-ven-rivage-studio'));
    const preview = await screen.findByTestId('point-preview');
    expect(within(preview).getByText('Atelier Rivage')).toBeTruthy();
    // Private studio: approximate area message, never an address.
    expect(within(preview).getByText(/Approximate area/)).toBeTruthy();
    await fireEvent.press(within(preview).getByTestId('preview-open-profile'));
    expect(router.push).toHaveBeenCalledWith('/organizations/org-atelier-rivage');
  });

  it('searches cities in any language and moves the map', async () => {
    await renderWithProviders(<DiscoverScreen />);
    await fireEvent.press(await screen.findByTestId('open-city-picker'));
    await fireEvent.changeText(screen.getByTestId('city-search-input'), 'Лондон');
    expect(screen.queryByTestId('city-paris')).toBeNull();
    await fireEvent.press(screen.getByTestId('city-london'));
    expect(mockLastMapProps.current?.camera.center.latitude).toBeCloseTo(51.5072, 3);
    expect(await screen.findByText('London')).toBeTruthy();
  });

  it('explains before asking for location, then uses a coarse position only', async () => {
    location.getForegroundPermissionsAsync.mockResolvedValue({
      granted: false,
      canAskAgain: true,
    } as never);
    location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 43.738417, longitude: 7.424616 },
    } as never);

    await renderWithProviders(<DiscoverScreen />);
    await fireEvent.press(await screen.findByTestId('near-me'));
    expect(await screen.findByText(/never stored/)).toBeTruthy();
    expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('location-allow'));
    expect(location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    // Rounded to two decimals (about 1 km), decision P-12.
    expect(mockLastMapProps.current?.userArea).toEqual({ latitude: 43.74, longitude: 7.42 });
  });

  it('offers Settings and city search when location was refused', async () => {
    location.getForegroundPermissionsAsync.mockResolvedValue({
      granted: false,
      canAskAgain: false,
    } as never);
    await renderWithProviders(<DiscoverScreen />);
    await fireEvent.press(await screen.findByTestId('near-me'));
    expect(await screen.findByTestId('location-denied')).toBeTruthy();
    expect(screen.getByText('Open Settings')).toBeTruthy();
    expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('filters the map to venues with matching classes', async () => {
    await renderWithProviders(<DiscoverScreen />);
    await screen.findByTestId('map-ven-larvotto');
    await fireEvent.press(screen.getByTestId('open-filters'));
    await fireEvent.press(screen.getByTestId('filter-specialty-reformer'));
    await fireEvent.press(screen.getByTestId('apply-filters'));
    const venueIds = (mockLastMapProps.current?.points ?? []).map((p) => p.venueId).sort();
    expect(venueIds).toEqual([
      'ven-hudson-studio',
      'ven-northbank-studio',
      'ven-rivage-studio',
      'ven-velours-studio',
    ]);
  });

  it('switches to the list and opens a class', async () => {
    await renderWithProviders(<DiscoverScreen />);
    await fireEvent.press(await screen.findByTestId('toggle-view'));
    const card = await screen.findByTestId('class-card-cls-1');
    await fireEvent.press(card);
    expect(router.push).toHaveBeenCalledWith('/classes/cls-1');
  });
});

describe('Profiles and class page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('studio profile: fictional banner, private place without address, instructors', async () => {
    await renderWithProviders(<OrganizationScreen id="org-atelier-rivage" />);
    expect(await screen.findByText('Atelier Rivage')).toBeTruthy();
    expect(screen.getByTestId('fictional-banner')).toBeTruthy();
    expect(screen.getAllByText(/Approximate area/).length).toBeGreaterThan(0);
    expect(screen.getByText('Larvotto public beach, Monaco')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('instructor-row-ins-anya'));
    expect(router.push).toHaveBeenCalledWith('/instructors/ins-anya');
  });

  it('studio profile can be followed', async () => {
    await renderWithProviders(<OrganizationScreen id="org-velours-paris" />, 'en', {
      prototype: { followedOrganizations: [] },
    });
    const follow = await screen.findByTestId('follow-org-velours-paris');
    expect(follow).not.toBeSelected();
    await fireEvent.press(follow);
    expect(screen.getByTestId('follow-org-velours-paris')).toBeSelected();
  });

  it('instructor profile lists several organizations (P-02) and declared qualifications', async () => {
    await renderWithProviders(<InstructorScreen id="ins-lea" />, 'fr');
    expect(await screen.findByText('Léa M.')).toBeTruthy();
    expect(screen.getByTestId('affiliation-org-atelier-rivage')).toBeTruthy();
    expect(screen.getByTestId('affiliation-org-matins-bleus')).toBeTruthy();
    expect(screen.getByTestId('affiliation-org-lumen-nice')).toBeTruthy();
    expect(screen.getByText(/ORÉVA ne les a pas vérifiées/)).toBeTruthy();
  });

  it('class page shows local time, price paid at the venue, and no booking yet', async () => {
    await renderWithProviders(<ClassDetailScreen id="cls-1" />, 'ru');
    expect(await screen.findByText('Мат на рассвете')).toBeTruthy();
    expect(screen.getByText(/по местному времени: Монако/)).toBeTruthy();
    expect(screen.getByText(/оплата на месте/)).toBeTruthy();
    expect(screen.getByTestId('book-class')).toBeDisabled();
  });
});
