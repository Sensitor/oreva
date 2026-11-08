import type { GeoPoint } from './domain';

const EARTH_RADIUS_M = 6_371_008.8;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance in metres (haversine). */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Point reached from `origin` after `meters` on `bearingDeg` (0 = north). */
export function destination(origin: GeoPoint, meters: number, bearingDeg: number): GeoPoint {
  const angular = meters / EARTH_RADIUS_M;
  const bearing = toRad(bearingDeg);
  const lat1 = toRad(origin.latitude);
  const lon1 = toRad(origin.longitude);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
    );
  return { latitude: toDeg(lat2), longitude: ((toDeg(lon2) + 540) % 360) - 180 };
}

/** Closed ring approximating a circle, for drawing an approximate area on any map provider. */
export function circleRing(center: GeoPoint, radiusMeters: number, steps = 48): GeoPoint[] {
  const ring: GeoPoint[] = [];
  for (let i = 0; i <= steps; i += 1) {
    ring.push(destination(center, radiusMeters, (360 * i) / steps));
  }
  return ring;
}

/**
 * Coarse location for "Near me" (decision P-12): two decimals is about 1.1 km
 * of latitude. Only this rounded value is used; it is never stored or logged.
 */
export function coarsenLocation(point: GeoPoint, decimals = 2): GeoPoint {
  const factor = 10 ** decimals;
  return {
    latitude: Math.round(point.latitude * factor) / factor,
    longitude: Math.round(point.longitude * factor) / factor,
  };
}

export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export function boundingBoxOf(points: GeoPoint[], paddingRatio = 0.15): BoundingBox | null {
  if (points.length === 0) {
    return null;
  }
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const p of points) {
    west = Math.min(west, p.longitude);
    east = Math.max(east, p.longitude);
    south = Math.min(south, p.latitude);
    north = Math.max(north, p.latitude);
  }
  const padLon = Math.max((east - west) * paddingRatio, 0.01);
  const padLat = Math.max((north - south) * paddingRatio, 0.01);
  return { west: west - padLon, south: south - padLat, east: east + padLon, north: north + padLat };
}
