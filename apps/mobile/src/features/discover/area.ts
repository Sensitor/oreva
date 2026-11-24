import { distanceMeters, type GeoPoint, type MapPoint } from '@oreva/core';
import type { ClassListItem } from '@/data/types';
import type { MapCamera } from './map/types';

/**
 * Where Discover is looking. Three separate states:
 * - `city`: the member picked a city; results are limited to it.
 * - `explore`: no city and no location; every result, no geographic limit.
 * - `near`: only after the member tapped "Near me" and allowed location;
 *   results within NEAR_RADIUS_M of a coarse position (decision P-12).
 */
export type DiscoverArea =
  { kind: 'city'; cityId: string } | { kind: 'explore' } | { kind: 'near'; point: GeoPoint };

export const EXPLORE: DiscoverArea = { kind: 'explore' };

export const NEAR_RADIUS_M = 30_000;

/** World view used in explore mode: every demo city, from New York to Dubai. */
export const EXPLORE_CAMERA: Omit<MapCamera, 'revision'> = {
  center: { latitude: 38, longitude: -9 },
  zoom: 1.4,
};

export function venuePoint(item: ClassListItem): GeoPoint {
  return item.venue.visibility === 'public'
    ? item.venue.location
    : item.venue.approximateArea.center;
}

/** Classes in the area (already filtered), nearest first in Near me. Used by the list and the count. */
export function itemsInArea(items: ClassListItem[], area: DiscoverArea): ClassListItem[] {
  switch (area.kind) {
    case 'city':
      return items.filter((item) => item.city.id === area.cityId);
    case 'explore':
      return items;
    case 'near':
      return items
        .map((item) => ({ item, meters: distanceMeters(area.point, venuePoint(item)) }))
        .filter(({ meters }) => meters <= NEAR_RADIUS_M)
        .sort((a, b) => a.meters - b.meters)
        .map(({ item }) => item);
  }
}

/**
 * Map points for the same area as the list. With filters on, only venues that
 * have a matching class in the area; without filters, every venue in the area.
 */
export function pointsInArea(
  points: MapPoint[],
  area: DiscoverArea,
  areaItems: ClassListItem[],
  filtersActive: boolean,
): MapPoint[] {
  const inArea = points.filter((point) => {
    switch (area.kind) {
      case 'city':
        return point.cityId === area.cityId;
      case 'explore':
        return true;
      case 'near':
        return distanceMeters(area.point, point.coordinate) <= NEAR_RADIUS_M;
    }
  });
  if (!filtersActive) {
    return inArea;
  }
  const venueIds = new Set(areaItems.map((item) => item.venue.id));
  return inArea.filter((point) => venueIds.has(point.venueId));
}
