/**
 * Typography tokens.
 *
 * Two candidate typefaces are tested in Phase 1 (decision P-14). Both have full
 * Cyrillic support and an OFL licence. The founders choose one after reviewing
 * real EN / FR / RU screens; `defaultTypeface` changes in one place.
 */
export const typefaces = {
  manrope: {
    label: 'Manrope',
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semibold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
  },
  onest: {
    label: 'Onest',
    regular: 'Onest_400Regular',
    medium: 'Onest_500Medium',
    semibold: 'Onest_600SemiBold',
    bold: 'Onest_700Bold',
  },
} as const;

export type TypefaceName = keyof typeof typefaces;
export type FontWeightName = 'regular' | 'medium' | 'semibold' | 'bold';

export const defaultTypeface: TypefaceName = 'manrope';

export interface TextStyleToken {
  fontSize: number;
  lineHeight: number;
  weight: FontWeightName;
  letterSpacing?: number;
}

/**
 * Type scale. Sizes are in points and scale with the user's system text size
 * (Dynamic Type / font scale). Line heights leave room for Cyrillic and accents.
 */
export const textStyles = {
  display: { fontSize: 34, lineHeight: 41, weight: 'bold', letterSpacing: -0.4 },
  title1: { fontSize: 28, lineHeight: 34, weight: 'bold', letterSpacing: -0.3 },
  title2: { fontSize: 22, lineHeight: 28, weight: 'semibold' },
  headline: { fontSize: 17, lineHeight: 23, weight: 'semibold' },
  body: { fontSize: 16, lineHeight: 24, weight: 'regular' },
  bodyStrong: { fontSize: 16, lineHeight: 24, weight: 'semibold' },
  callout: { fontSize: 15, lineHeight: 21, weight: 'medium' },
  footnote: { fontSize: 13, lineHeight: 18, weight: 'regular' },
  caption: { fontSize: 12, lineHeight: 16, weight: 'medium' },
} as const satisfies Record<string, TextStyleToken>;

export type TextStyleName = keyof typeof textStyles;
