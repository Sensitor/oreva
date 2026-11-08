import { palette } from './palette';

/**
 * Semantic color tokens. Every text/background pairing used by components is
 * listed in `contrastPairs` and checked against WCAG 2.2 AA in the test suite.
 */
export const colors = {
  background: palette.neutral[50],
  backgroundTint: palette.lavender[100],
  surface: palette.neutral[0],
  surfaceMuted: palette.neutral[100],

  textPrimary: palette.neutral[900],
  textSecondary: palette.neutral[600],
  textOnPastelSecondary: palette.neutral[700],
  textOnAccent: palette.neutral[900],
  textOnAccentStrong: palette.neutral[0],
  textLink: palette.lavender[700],

  accent: palette.lavender[500],
  accentSoft: palette.lavender[300],
  accentStrong: palette.lavender[700],

  borderSubtle: palette.neutral[200],
  borderControl: palette.neutral[400],
  focusRing: palette.lavender[700],

  tileMint: palette.mint[300],
  tileViolet: palette.lavender[300],
  tileOrchid: palette.orchid[300],

  success: palette.mint[700],
  successSurface: palette.mint[200],
  info: palette.sky[700],
  infoSurface: palette.sky[200],
  danger: palette.red[700],

  overlay: 'rgba(38, 35, 45, 0.4)',
  shadow: 'rgba(38, 35, 45, 0.08)',
} as const;

export type ColorToken = keyof typeof colors;

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
  { foreground: 'textPrimary', background: 'tileMint', kind: 'text', usage: 'tile titles' },
  { foreground: 'textPrimary', background: 'tileViolet', kind: 'text', usage: 'tile titles' },
  { foreground: 'textPrimary', background: 'tileOrchid', kind: 'text', usage: 'tile titles' },
  { foreground: 'textOnPastelSecondary', background: 'tileMint', kind: 'text', usage: 'tile meta' },
  {
    foreground: 'textOnPastelSecondary',
    background: 'tileViolet',
    kind: 'text',
    usage: 'tile meta',
  },
  {
    foreground: 'textOnPastelSecondary',
    background: 'tileOrchid',
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
];
