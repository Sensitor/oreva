import { describe, expect, it } from '@jest/globals';
import { createDemoRepositories } from '@/data/demoRepositories';
import { applyClassFilters } from '@/data/filters';
import { DEFAULT_CLASS_FILTERS } from '@/data/types';
import {
  EXPLORE,
  itemsInArea,
  NEAR_RADIUS_M,
  pointsInArea,
  type DiscoverArea,
} from '@/features/discover/area';
import { TEST_NOW } from '@/test-utils';

async function demo() {
  const { discover } = createDemoRepositories(TEST_NOW);
  return {
    items: await discover.classes(DEFAULT_CLASS_FILTERS, TEST_NOW),
    points: await discover.mapPoints(),
  };
}

const MONACO: DiscoverArea = { kind: 'city', cityId: 'monaco' };
const NEAR_MONACO: DiscoverArea = { kind: 'near', point: { latitude: 43.74, longitude: 7.42 } };

describe('Discover area: city, explore, near me', () => {
  it('city: only that city, on the map and in the list', async () => {
    const { items, points } = await demo();
    const inCity = itemsInArea(items, MONACO);
    expect(inCity.length).toBe(5);
    expect(inCity.every((item) => item.city.id === 'monaco')).toBe(true);
    const mapped = pointsInArea(points, MONACO, inCity, false);
    expect(mapped.every((point) => point.cityId === 'monaco')).toBe(true);
    expect(mapped).toHaveLength(3);
  });

  it('explore: every class and every venue, no geographic limit', async () => {
    const { items, points } = await demo();
    expect(itemsInArea(items, EXPLORE)).toEqual(items);
    expect(pointsInArea(points, EXPLORE, items, false)).toEqual(points);
  });

  it('near me: within the radius only, nearest first', async () => {
    const { items, points } = await demo();
    const near = itemsInArea(items, NEAR_MONACO);
    const cities = new Set(near.map((item) => item.city.id));
    // Monaco and Nice are within 30 km; Paris is not.
    expect(cities.has('monaco')).toBe(true);
    expect(cities.has('paris')).toBe(false);
    expect(NEAR_RADIUS_M).toBe(30_000);
    const mapped = pointsInArea(points, NEAR_MONACO, near, false);
    expect(mapped.some((point) => point.cityId === 'paris')).toBe(false);
  });

  it('with filters: the map keeps only venues that have a matching class in the area', async () => {
    const { items, points } = await demo();
    const reformer = applyClassFilters(
      items,
      { ...DEFAULT_CLASS_FILTERS, specialties: ['reformer'] },
      TEST_NOW,
    );
    for (const area of [MONACO, EXPLORE, NEAR_MONACO]) {
      const areaItems = itemsInArea(reformer, area);
      const venueIds = new Set(areaItems.map((item) => item.venue.id));
      const mapped = pointsInArea(points, area, areaItems, true);
      expect(new Set(mapped.map((point) => point.venueId))).toEqual(venueIds);
    }
  });
});
