/**
 * La Ligne, ORÉVA's signature: one gesture, like a breath taken and let go.
 * It rises, turns once and settles long. Drawn as a filled shape whose width
 * swells in the middle and tapers to fine points, the way a brush or a pen
 * leaves it, never as a mechanical wave.
 *
 * The geometry is computed once from two cubic curves in a 160 x 28 box.
 */
export const LA_LIGNE_BOX = { width: 160, height: 28 } as const;

type Point = { x: number; y: number };
type Cubic = [Point, Point, Point, Point];

const SEGMENTS: readonly Cubic[] = [
  [
    { x: 3, y: 21 },
    { x: 34, y: 22 },
    { x: 50, y: 5 },
    { x: 78, y: 5 },
  ],
  [
    { x: 78, y: 5 },
    { x: 104, y: 5 },
    { x: 118, y: 17 },
    { x: 157, y: 14 },
  ],
];

/** Widest point of the stroke, in box units. */
const MAX_WIDTH = 2.6;
const SAMPLES_PER_SEGMENT = 40;

function bezier([p0, p1, p2, p3]: Cubic, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

function tangent([p0, p1, p2, p3]: Cubic, t: number): Point {
  const u = 1 - t;
  return {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}

/** Points along the centre of the gesture, with their direction. */
function centreline(): { point: Point; direction: Point }[] {
  const out: { point: Point; direction: Point }[] = [];
  SEGMENTS.forEach((segment, index) => {
    for (let i = index === 0 ? 0 : 1; i <= SAMPLES_PER_SEGMENT; i += 1) {
      const t = i / SAMPLES_PER_SEGMENT;
      out.push({ point: bezier(segment, t), direction: tangent(segment, t) });
    }
  });
  return out;
}

const f = (n: number) => n.toFixed(2);

/** The centre of the stroke, as an SVG path (used to reveal the shape as it draws). */
export const LA_LIGNE_CENTRE = SEGMENTS.map(
  ([p0, p1, p2, p3], i) =>
    `${i === 0 ? `M${f(p0.x)} ${f(p0.y)} ` : ''}C${f(p1.x)} ${f(p1.y)} ${f(p2.x)} ${f(p2.y)} ${f(p3.x)} ${f(p3.y)}`,
).join(' ');

/** Length of the centre line, for the drawing animation. */
export const LA_LIGNE_LENGTH = (() => {
  const points = centreline().map((c) => c.point);
  let length = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    if (a && b) {
      length += Math.hypot(b.x - a.x, b.y - a.y);
    }
  }
  return length;
})();

/** The tapered outline: along one side, back along the other. */
export const LA_LIGNE_OUTLINE = (() => {
  const line = centreline();
  const last = line.length - 1;
  const left: Point[] = [];
  const right: Point[] = [];
  line.forEach(({ point, direction }, i) => {
    const t = i / last;
    // Fine at both ends, fullest a little before the middle (the breath in).
    const width = 0.25 + (MAX_WIDTH - 0.25) * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.85)), 0.9);
    const length = Math.hypot(direction.x, direction.y) || 1;
    const nx = -direction.y / length;
    const ny = direction.x / length;
    left.push({ x: point.x + (nx * width) / 2, y: point.y + (ny * width) / 2 });
    right.push({ x: point.x - (nx * width) / 2, y: point.y - (ny * width) / 2 });
  });
  const forward = left.map((p, i) => `${i === 0 ? 'M' : 'L'}${f(p.x)} ${f(p.y)}`).join(' ');
  const back = right
    .reverse()
    .map((p) => `L${f(p.x)} ${f(p.y)}`)
    .join(' ');
  return `${forward} ${back} Z`;
})();
