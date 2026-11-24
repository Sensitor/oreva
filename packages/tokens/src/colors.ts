import { palette } from './palette';

/**
 * Semantic color tokens. Every text/background pairing used by components is
 * listed in `contrastPairs` and checked against WCAG 2.2 AA in the test suite.
 */
export const colors = {
  background: palette.cream[100],
  backgroundTint: palette.lavender[100],
  surface: palette.cream[50],
  surfaceMuted: palette.cream[200],

  textPrimary: palette.plum[900],
  textSecondary: palette.stone[500],
  textOnPastelSecondary: palette.stone[600],
  textOnAccent: palette.plum[900],
  textOnAccentStrong: palette.cream[50],
  textLink: palette.lavender[600],
  /** Serif titles and brand moments. */
  textBrand: palette.plum[700],

  /** Lavender is a fill with ink text on it, never white (2.94:1 fails). */
  accent: palette.lavender[400],
  accentSoft: palette.lavender[100],
  accentStrong: palette.plum[700],

  /** Primary action (plum, cream label). Used by the Phase B button. */
  actionPrimary: palette.plum[700],
  textOnAction: palette.cream[100],
  /** Progress lines, active marks: the lavender hue, deep enough to see on cream. */
  progress: palette.lavender[600],

  borderSubtle: palette.cream[300],
  borderControl: palette.cream[500],
  focusRing: palette.lavender[600],

  /** Soft tints for covers and cards without a photo (see `tints`). */
  tintSand: palette.cream[200],
  tintLilac: palette.lavender[100],
  tintMist: palette.lavender[200],

  success: palette.sage[600],
  successSurface: palette.sage[100],
  info: palette.lavender[600],
  infoSurface: palette.cream[200],
  danger: palette.red[700],

  overlay: 'rgba(42, 34, 48, 0.4)',
  shadow: 'rgba(75, 54, 93, 0.08)',
} as const;

export type ColorToken = keyof typeof colors;

/** Cover tints by name, as stored on demo content (`CoverTint` in @oreva/core). */
export const tints = {
  sand: colors.tintSand,
  lilac: colors.tintLilac,
  mist: colors.tintMist,
} as const;

export type TintName = keyof typeof tints;

export type ContrastKind = 'text' | 'largeText' | 'nonText';

export interface ContrastPair {
  foreground: ColorToken;
  background: ColorToken;
  kind: ContrastKind;
  usage: string;
}

/** Pairings used in the UI. The test suite fails if any of them drops below AA. */
export const contrastPairs: readonly ContrastPair[] = [
  { foreground: 'textPrimary', background: 'background', kind: 'text', usage: 'body text' },
  { foreground: 'textPrimary', background: 'surface', kind: 'text', usage: 'text on cards' },
  { foreground: 'textPrimary', background: 'surfaceMuted', kind: 'text', usage: 'chip labels' },
  { foreground: 'textSecondary', background: 'background', kind: 'text', usage: 'meta text' },
  { foreground: 'textSecondary', background: 'surface', kind: 'text', usage: 'meta text on cards' },
  {
    foreground: 'textSecondary',
    background: 'surfaceMuted',
    kind: 'text',
    usage: 'meta text on chips',
  },
  {
    foreground: 'textOnAccent',
    background: 'accent',
    kind: 'text',
    usage: 'primary buttons, active tab',
  },
  {
    foreground: 'textOnAccentStrong',
    background: 'accentStrong',
    kind: 'text',
    usage: 'hero cards with white text',
  },
  { foreground: 'textLink', background: 'background', kind: 'text', usage: 'links' },
  { foreground: 'textLink', background: 'surface', kind: 'text', usage: 'links on cards' },
  {
    foreground: 'textLink',
    background: 'backgroundTint',
    kind: 'text',
    usage: 'links on tinted panels',
  },
  { foreground: 'textPrimary', background: 'tintSand', kind: 'text', usage: 'tile titles' },
  { foreground: 'textPrimary', background: 'tintLilac', kind: 'text', usage: 'tile titles' },
  { foreground: 'textPrimary', background: 'tintMist', kind: 'text', usage: 'tile titles' },
  { foreground: 'textOnPastelSecondary', background: 'tintSand', kind: 'text', usage: 'tile meta' },
  {
    foreground: 'textOnPastelSecondary',
    background: 'tintLilac',
    kind: 'text',
    usage: 'tile meta',
  },
  {
    foreground: 'textOnPastelSecondary',
    background: 'tintMist',
    kind: 'text',
    usage: 'tile meta',
  },
  {
    foreground: 'textOnPastelSecondary',
    background: 'backgroundTint',
    kind: 'text',
    usage: 'meta on tint',
  },
  { foreground: 'success', background: 'successSurface', kind: 'text', usage: 'success messages' },
  {
    foreground: 'info',
    background: 'infoSurface',
    kind: 'text',
    usage: 'weather and class updates',
  },
  { foreground: 'danger', background: 'surface', kind: 'text', usage: 'error messages' },
  { foreground: 'danger', background: 'background', kind: 'text', usage: 'inline errors' },
  {
    foreground: 'borderControl',
    background: 'background',
    kind: 'nonText',
    usage: 'control boundaries',
  },
  {
    foreground: 'borderControl',
    background: 'surface',
    kind: 'nonText',
    usage: 'control boundaries on cards',
  },
  { foreground: 'focusRing', background: 'background', kind: 'nonText', usage: 'focus indicator' },
  {
    foreground: 'textOnAccent',
    background: 'accent',
    kind: 'nonText',
    usage: 'icons on lavender (play/pause)',
  },
  { foreground: 'textBrand', background: 'background', kind: 'text', usage: 'serif titles' },
  { foreground: 'textBrand', background: 'surface', kind: 'text', usage: 'serif titles on paper' },
  {
    foreground: 'textBrand',
    background: 'surfaceMuted',
    kind: 'text',
    usage: 'serif titles on sand',
  },
  {
    foreground: 'textOnAction',
    background: 'actionPrimary',
    kind: 'text',
    usage: 'primary button labels',
  },
  {
    foreground: 'actionPrimary',
    background: 'background',
    kind: 'nonText',
    usage: 'outline buttons',
  },
  { foreground: 'progress', background: 'background', kind: 'nonText', usage: 'progress lines' },
  { foreground: 'progress', background: 'surface', kind: 'nonText', usage: 'progress on paper' },
  {
    foreground: 'progress',
    background: 'accentSoft',
    kind: 'nonText',
    usage: 'progress on lilac',
  },
  { foreground: 'textLink', background: 'surfaceMuted', kind: 'text', usage: 'links on sand' },
  {
    foreground: 'textOnPastelSecondary',
    background: 'accentSoft',
    kind: 'text',
    usage: 'meta on selected chips (stone alone is 4.4996:1 on lilac, just under AA)',
  },
  {
    foreground: 'textOnPastelSecondary',
    background: 'surface',
    kind: 'text',
    usage: 'sample data tag',
  },
  { foreground: 'textBrand', background: 'accentSoft', kind: 'text', usage: 'titles on lilac' },
  { foreground: 'textBrand', background: 'tintSand', kind: 'text', usage: 'initials on sand' },
  { foreground: 'success', background: 'background', kind: 'nonText', usage: 'completed mark' },
  { foreground: 'textBrand', background: 'tintMist', kind: 'text', usage: 'initials on mist' },
  {
    foreground: 'textBrand',
    background: 'backgroundTint',
    kind: 'text',
    usage: 'initials and titles on the page tint',
  },
  {
    foreground: 'actionPrimary',
    background: 'surface',
    kind: 'nonText',
    usage: 'secondary button edge, active tab line',
  },
];
