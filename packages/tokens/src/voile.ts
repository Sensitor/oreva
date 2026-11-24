import { colors, type ColorToken } from './colors';
import { palette } from './palette';

/**
 * Voile: the soft layered gradient that stands in for photography until real,
 * documented partner photos exist (decision P-14, point 5). It is abstract by
 * design: never a picture of people, studios or classes.
 *
 * Every stop is opaque and listed here, so the test suite checks the text and
 * meta colors against each stop; the overlay layers only blend between stops.
 */
export interface VoileToken {
  /** Gradient stops, from the top start corner to the bottom end corner. */
  stops: readonly [string, string, string];
  /** Titles on this voile. */
  text: ColorToken;
  /** Kicker and meta text on this voile. */
  meta: ColorToken;
  /** The faint line drawn across it (decorative). */
  line: string;
}

export const voiles = {
  lilac: {
    stops: [palette.lavender[100], palette.lavender[200], palette.cream[50]],
    text: 'textPrimary',
    meta: 'textOnPastelSecondary',
    line: palette.lavender[400],
  },
  sand: {
    stops: [palette.cream[200], palette.cream[100], palette.lavender[100]],
    text: 'textPrimary',
    meta: 'textOnPastelSecondary',
    line: palette.cream[500],
  },
  mist: {
    stops: [palette.lavender[200], palette.lavender[100], palette.cream[200]],
    text: 'textPrimary',
    meta: 'textOnPastelSecondary',
    line: palette.lavender[400],
  },
  plum: {
    stops: [palette.plum[900], palette.plum[700], palette.lavender[600]],
    text: 'textOnAccentStrong',
    meta: 'textOnAccentStrong',
    line: palette.lavender[400],
  },
} as const satisfies Record<string, VoileToken>;

export type VoileTint = keyof typeof voiles;

/** Text color on a voile, resolved. */
export function voileTextColor(tint: VoileTint, role: 'text' | 'meta' = 'text'): string {
  return colors[voiles[tint][role]];
}
