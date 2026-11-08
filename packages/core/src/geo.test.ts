import { describe, expect, it } from 'vitest';
import { boundingBoxOf, circleRing, coarsenLocation, destination, distanceMeters } from './geo';

const monaco = { latitude: 43.7384, longitude: 7.4246 };
const nice = { latitude: 43.7102, longitude: 7.262 };

describe('geo', () => {
  it('measures distances', () => {
    expect(distanceMeters(monaco, nice) / 1000).toBeCloseTo(13.4, 0);
    expect(distanceMeters(monaco, monaco)).toBe(0);
  });

  it('draws an approximate area whose ring sits at the radius', () => {
    const ring = circleRing(monaco, 400, 24);
    expect(ring).toHaveLength(25);
    expect(ring[0]).toEqual(ring[24]);
    for (const p of ring) {
      expect(distanceMeters(monaco, p)).toBeCloseTo(400, -1);
    }
  });

  it('coarsens Near Me coordinates to about 1 km (P-12)', () => {
    const coarse = coarsenLocation({ latitude: 43.738417, longitude: 7.424616 });
    expect(coarse).toEqual({ latitude: 43.74, longitude: 7.42 });
    expect(distanceMeters(coarse, { latitude: 43.738417, longitude: 7.424616 })).toBeLessThan(1200);
  });

  it('computes destinations across the antimeridian', () => {
    const p = destination({ latitude: 0, longitude: 179.99 }, 5000, 90);
    expect(p.longitude).toBeLessThan(-179);
  });

  it('pads bounding boxes and handles empty input', () => {
    const box = boundingBoxOf([monaco, nice]);
    expect(box && box.west < nice.longitude && box.east > monaco.longitude).toBe(true);
    expect(boundingBoxOf([])).toBeNull();
  });
});
