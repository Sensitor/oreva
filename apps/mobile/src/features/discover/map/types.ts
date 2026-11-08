import type { GeoPoint, MapPoint } from '@oreva/core';

export interface MapCamera {
  center: GeoPoint;
  zoom: number;
  /** Incremented to move the camera even when the target did not change. */
  revision: number;
}

export interface DiscoverMapProps {
  points: MapPoint[];
  selectedPointId: string | null;
  onSelectPoint: (point: MapPoint | null) => void;
  camera: MapCamera;
  /** Coarse "near me" location (P-12), drawn as an approximate 1 km area. */
  userArea: GeoPoint | null;
  reduceMotion: boolean;
  labels: {
    map: string;
    point: (point: MapPoint) => string;
    cluster: (count: number) => string;
  };
}

/** Longitude span shown at a given zoom level (web-mercator convention). */
export function longitudeDeltaForZoom(zoom: number): number {
  return 360 / 2 ** zoom;
}

export function zoomForLongitudeDelta(delta: number): number {
  return Math.log2(360 / Math.max(delta, 1e-6));
}
