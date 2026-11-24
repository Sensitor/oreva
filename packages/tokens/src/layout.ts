/** Spacing on a 4-point grid, with a screen gutter and section rhythm. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  /** Side margin of every screen. */
  gutter: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  /** Space between sections; more air between them, tighter inside. */
  section: 40,
  sectionLoose: 56,
} as const;

/**
 * A contrast of shapes: content is softly rectangular, actions stay round.
 * xs tags · sm inputs · md tickets and rows · lg images and sheets · xl hero covers.
 */
export const radii = {
  xs: 4,
  sm: 10,
  md: 14,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

/** Minimum touch target (iOS HIG 44pt, Material 48dp). */
export const touchTarget = {
  min: 44,
  comfortable: 48,
} as const;

/**
 * Depth is mostly tone and hairlines. Shadows are warm (plum-tinted) and kept
 * for things that float: the tab bar, sheets, the map preview.
 */
export const elevation = {
  none: 'none',
  soft: '0px 1px 2px rgba(75, 54, 93, 0.06)',
  raised: '0px 6px 18px rgba(75, 54, 93, 0.08)',
  floating: '0px 10px 30px rgba(75, 54, 93, 0.10)',
} as const;

/**
 * Slow, soft motion: eased, never bouncy. Every animation also has a Reduce
 * Motion version (instant, or opacity only).
 */
export const motion = {
  duration: {
    /** Press feedback. */
    fast: 120,
    /** Tab switch, small state changes. */
    base: 180,
    /** Screen entrance. */
    entrance: 240,
    slow: 320,
    /** Progress lines and rings. */
    progress: 600,
  },
  /** Delay between staggered items in an entrance (first five only). */
  stagger: 40,
  /** Cubic-bezier control points. */
  easing: {
    standard: [0.2, 0, 0, 1],
    out: [0.22, 1, 0.36, 1],
  },
  /** Pressed buttons and cards scale to this. */
  pressScale: 0.98,
  spring: {
    damping: 18,
    stiffness: 180,
    mass: 1,
  },
} as const;
