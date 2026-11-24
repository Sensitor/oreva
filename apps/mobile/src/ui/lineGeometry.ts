/**
 * Geometry of La Ligne, the ORÉVA signature line: a slow, uneven wave, like a
 * breath or the spine in a roll-down. Two sines with different periods keep it
 * from looking mechanical. Pure functions, so the shape is testable.
 */
export interface WaveOptions {
  /** Number of main undulations across the width. */
  cycles?: number;
  /** Phase shift in radians. */
  phase?: number;
}

export interface Point {
  x: number;
  y: number;
}

/** Points along the wave, inset by `inset` so round caps and dots are not clipped. */
export function wavePoints(
  width: number,
  height: number,
  { cycles = 1.5, phase = 0 }: WaveOptions = {},
  inset = 0,
  samples = 48,
): Point[] {
  if (width <= 0 || height <= 0) {
    return [];
  }
  const span = Math.max(width - inset * 2, 0);
  const mid = height / 2;
  const amplitude = Math.max(height / 2 - inset, 0);
  const points: Point[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const angle = Math.PI * 2 * cycles * t + phase;
    const y = mid - amplitude * (0.72 * Math.sin(angle) + 0.28 * Math.sin(angle * 1.7 + 0.6));
    points.push({ x: inset + span * t, y });
  }
  return points;
}

export function pathFromPoints(points: readonly Point[]): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');
}

export function pathLength(points: readonly Point[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    if (a && b) {
      length += Math.hypot(b.x - a.x, b.y - a.y);
    }
  }
  return length;
}

/** The point on the wave nearest to a fraction (0 to 1) of its width. */
export function pointAt(points: readonly Point[], fraction: number): Point | undefined {
  if (points.length === 0) {
    return undefined;
  }
  const index = Math.round(Math.min(Math.max(fraction, 0), 1) * (points.length - 1));
  return points[index];
}
