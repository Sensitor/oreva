import type { GeoPoint, MapPoint } from '@oreva/core';

export type GridItem =
  | { kind: 'point'; id: string; coordinate: GeoPoint; point: MapPoint }
  | { kind: 'cluster'; id: string; coordinate: GeoPoint; count: number; points: MapPoint[] };

/**
 * Simple grid clustering for providers without native clustering (Apple Maps
 * through react-native-maps). Points falling in the same cell of a grid sized
 * from the visible longitude span are merged. Mapbox uses its native
 * clustering instead.
 */
export function clusterOnGrid(
  points: MapPoint[],
  longitudeDelta: number,
  cellsAcross = 7,
): GridItem[] {
  const cell = Math.max(longitudeDelta / cellsAcross, 1e-4);
  const groups = new Map<string, MapPoint[]>();
  for (const point of points) {
    const key = `${Math.floor(point.coordinate.longitude / cell)}:${Math.floor(point.coordinate.latitude / cell)}`;
    const group = groups.get(key);
    if (group) {
      group.push(point);
    } else {
      groups.set(key, [point]);
    }
  }
  const items: GridItem[] = [];
  for (const [key, group] of groups) {
    const first = group[0];
    if (!first) {
      continue;
    }
    if (group.length === 1) {
      items.push({ kind: 'point', id: first.id, coordinate: first.coordinate, point: first });
    } else {
      const latitude = group.reduce((sum, p) => sum + p.coordinate.latitude, 0) / group.length;
      const longitude = group.reduce((sum, p) => sum + p.coordinate.longitude, 0) / group.length;
      items.push({
        kind: 'cluster',
        id: `cluster-${key}`,
        coordinate: { latitude, longitude },
        count: group.length,
        points: group,
      });
    }
  }
  return items;
}
