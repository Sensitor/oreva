/** Spacing scale from the cahier des charges (4/8/12/16/24/32), extended. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

/** Very round geometry, as in the visual reference (cards 20 to 32). */
export const radii = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 32,
  pill: 999,
} as const;

/** Minimum touch target (iOS HIG 44pt, Material 48dp). */
export const touchTarget = {
  min: 44,
  comfortable: 48,
} as const;

/** Soft depth, as CSS-style box shadows (supported by React Native and the web). */
export const elevation = {
  none: 'none',
  soft: '0px 4px 12px rgba(38, 35, 45, 0.06)',
  raised: '0px 10px 28px rgba(38, 35, 45, 0.10)',
  floating: '0px 16px 40px rgba(38, 35, 45, 0.14)',
} as const;

/** Short, soft motion. Every animation must also respect Reduce Motion. */
export const motion = {
  duration: {
    fast: 150,
    base: 220,
    slow: 320,
  },
  spring: {
    damping: 18,
    stiffness: 180,
    mass: 1,
  },
} as const;
