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
import { createDemoRepositories } from '@/data/demoRepositories';
import { DEFAULT_CLASS_FILTERS } from '@/data/types';
import { renderWithProviders, TEST_NOW } from '@/test-utils';

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

const mapVenueIds = () => (mockLastMapProps.current?.points ?? []).map((p) => p.venueId).sort();

async function applyReformerFilter() {
  await fireEvent.press(screen.getByTestId('open-filters'));
  await fireEvent.press(screen.getByTestId('filter-specialty-reformer'));
  await fireEvent.press(screen.getByTestId('apply-filters'));
}

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

  it('shows the selected city on the map, private venues as approximate areas only', async () => {
    await renderWithProviders(<DiscoverScreen />);
    await screen.findByTestId('map-ven-larvotto');
    expect(mapVenueIds()).toEqual(['ven-fontvieille', 'ven-larvotto', 'ven-rivage-studio']);
    const privatePoint = mockLastMapProps.current?.points.find(
      (p) => p.venueId === 'ven-rivage-studio',
    );
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
    // Monaco is selected: only its Reformer venue.
    expect(mapVenueIds()).toEqual(['ven-rivage-studio']);
  });

  it('switches to the list and opens a class', async () => {
    await renderWithProviders(<DiscoverScreen />);
    await fireEvent.press(await screen.findByTestId('toggle-view'));
    const card = await screen.findByTestId('class-card-cls-1');
    await fireEvent.press(card);
    expect(router.push).toHaveBeenCalledWith('/classes/cls-1');
  });

  it('groups the list by day under a heading, each class as a ticket', async () => {
    await renderWithProviders(<DiscoverScreen />, 'fr');
    await fireEvent.press(await screen.findByTestId('toggle-view'));
    await screen.findAllByTestId(/^class-card-/);
    const days = screen
      .getAllByRole('header')
      .map((node) => String(node.props.children))
      .filter((text) => /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) \d+ /.test(text));
    expect(days.length).toBeGreaterThan(0);
    // Headings follow each other in calendar order and never repeat.
    expect(new Set(days).size).toBe(days.length);
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

describe('Discover: city, explore and Near me', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('clears the city with the X: explore mode, no city, no default, no location request', async () => {
    await renderWithProviders(<DiscoverScreen />);
    expect(await screen.findByText('Monaco')).toBeTruthy();
    expect(screen.getByLabelText('Clear Monaco')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('clear-area'));

    expect(screen.queryByText('Monaco')).toBeNull();
    expect(screen.getByTestId('search-placeholder')).toBeTruthy();
    expect(screen.getByText('Search a city or explore')).toBeTruthy();
    expect(screen.queryByTestId('clear-area')).toBeNull();
    // Every venue in the world, and the camera zooms out instead of picking a city.
    expect(mapVenueIds()).toHaveLength(15);
    expect(mockLastMapProps.current?.camera.zoom).toBeLessThan(3);
    expect(mockLastMapProps.current?.userArea).toBeNull();
    expect(await screen.findByText('17 classes')).toBeTruthy();
    // Near me is never started on its own.
    expect(location.getForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(location.getCurrentPositionAsync).not.toHaveBeenCalled();

    // The picker shows no city as selected.
    await fireEvent.press(screen.getByTestId('open-city-picker'));
    expect(screen.getByTestId('city-monaco').props.accessibilityState).toEqual({ selected: false });
  });

  it('lets the member pick another city right after clearing', async () => {
    await renderWithProviders(<DiscoverScreen />);
    await fireEvent.press(await screen.findByTestId('clear-area'));
    await fireEvent.press(screen.getByTestId('open-city-picker'));
    await fireEvent.press(screen.getByTestId('city-paris'));

    expect(await screen.findByText('Paris')).toBeTruthy();
    expect(screen.getByLabelText('Clear Paris')).toBeTruthy();
    expect(mapVenueIds()).toEqual(['ven-luxembourg', 'ven-monceau', 'ven-velours-studio']);
    expect(screen.getByText('3 classes')).toBeTruthy();
  });

  it('keeps the filters when the city is cleared or changed', async () => {
    await renderWithProviders(<DiscoverScreen />);
    await screen.findByTestId('map-ven-larvotto');
    await applyReformerFilter();
    expect(screen.getByText('Filters · 1')).toBeTruthy();
    expect(screen.getByText('1 class')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('clear-area'));
    expect(screen.getByText('Filters · 1')).toBeTruthy();
    expect(mapVenueIds()).toEqual([
      'ven-hudson-studio',
      'ven-northbank-studio',
      'ven-rivage-studio',
      'ven-velours-studio',
    ]);
    expect(screen.getByText('4 classes')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('open-city-picker'));
    await fireEvent.press(screen.getByTestId('city-paris'));
    expect(screen.getByText('Filters · 1')).toBeTruthy();
    expect(mapVenueIds()).toEqual(['ven-velours-studio']);
    expect(screen.getByText('1 class')).toBeTruthy();
  });

  it.each([
    ['a city', false],
    ['explore', true],
  ] as const)('shows the same results on the map and in the list (%s)', async (_label, clear) => {
    await renderWithProviders(<DiscoverScreen />);
    await screen.findByTestId('map-ven-larvotto');
    if (clear) {
      await fireEvent.press(screen.getByTestId('clear-area'));
    }
    const mapVenues = new Set(mapVenueIds());
    const expectedCount = clear ? '17 classes' : '5 classes';
    expect(screen.getByText(expectedCount)).toBeTruthy();

    await fireEvent.press(screen.getByTestId('toggle-view'));
    expect(screen.getByText(expectedCount)).toBeTruthy();
    const cards = await screen.findAllByTestId(/^class-card-/);
    expect(cards.length).toBeGreaterThan(0);
    // Every class in the list happens at a venue shown on the map.
    const classes = await createDemoRepositories(TEST_NOW).discover.classes(
      DEFAULT_CLASS_FILTERS,
      TEST_NOW,
    );
    for (const card of cards) {
      const sessionId = String(card.props.testID).replace('class-card-', '');
      const venueId = classes.find((item) => item.session.id === sessionId)?.venue.id;
      expect(venueId && mapVenues.has(venueId)).toBe(true);
    }
  });

  it('leaves Near me with the X and goes back to explore without a location', async () => {
    location.getForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 43.738417, longitude: 7.424616 },
    } as never);
    await renderWithProviders(<DiscoverScreen />);
    await fireEvent.press(await screen.findByTestId('near-me'));
    expect(await screen.findByLabelText('Stop using Near me')).toBeTruthy();
    expect(mockLastMapProps.current?.userArea).toEqual({ latitude: 43.74, longitude: 7.42 });

    await fireEvent.press(screen.getByTestId('clear-area'));
    expect(screen.getByTestId('search-placeholder')).toBeTruthy();
    expect(mockLastMapProps.current?.userArea).toBeNull();
    expect(mapVenueIds()).toHaveLength(15);
  });
});
