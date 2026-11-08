import { describe, expect, it } from '@jest/globals';
import { stressTestPoints } from '@oreva/demo-data';
import { clusterOnGrid } from '@/features/discover/map/clusterGrid';
import { longitudeDeltaForZoom, zoomForLongitudeDelta } from '@/features/discover/map/types';

describe('grid clustering (Apple Maps variant)', () => {
  const points = stressTestPoints(2000);

  it('merges many points at world zoom and keeps every point accounted for', () => {
    const items = clusterOnGrid(points, longitudeDeltaForZoom(2));
    expect(items.length).toBeLessThan(60);
    const total = items.reduce((sum, item) => sum + (item.kind === 'cluster' ? item.count : 1), 0);
    expect(total).toBe(2000);
  });

  it('separates points when zoomed in', () => {
    const london = points.filter((p) => p.cityId === 'london');
    const items = clusterOnGrid(london, longitudeDeltaForZoom(16));
    expect(items.every((item) => item.kind === 'point')).toBe(true);
  });

  it('converts between zoom and longitude span', () => {
    expect(zoomForLongitudeDelta(longitudeDeltaForZoom(11.5))).toBeCloseTo(11.5, 5);
  });
});
