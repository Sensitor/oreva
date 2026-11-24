/**
 * Typography tokens (design direction approved on 24 Nov 2026, decision P-14).
 *
 * Manrope for the interface, Cormorant Garamond for editorial titles and
 * numerals. Both are OFL and cover Latin and Cyrillic. The serif is never used
 * below 22pt: it is too delicate for body text.
 */
export const typefaces = {
  sans: {
    label: 'Manrope',
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semibold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
  },
  serif: {
    label: 'Cormorant Garamond',
    // Cormorant's Regular is too thin on screens: the lightest weight used is Medium.
    regular: 'CormorantGaramond_500Medium',
    medium: 'CormorantGaramond_500Medium',
    semibold: 'CormorantGaramond_600SemiBold',
    bold: 'CormorantGaramond_700Bold',
  },
} as const;

export type TypefaceName = keyof typeof typefaces;
export type FontWeightName = 'regular' | 'medium' | 'semibold' | 'bold';

export interface TextStyleToken {
  family: TypefaceName;
  fontSize: number;
  lineHeight: number;
  weight: FontWeightName;
  letterSpacing?: number;
  textTransform?: 'uppercase';
  /**
   * Cormorant's default figures are old-style, so a "1" can read as "I" ("Day 1").
   * Every serif style uses lining figures; numerals are also tabular.
   */
  fontVariant?: readonly ('lining-nums' | 'tabular-nums')[];
}

/** Smallest size at which the serif may be used. */
export const SERIF_MIN_SIZE = 22;

/**
 * Type scale. Sizes are in points and scale with the user's system text size
 * (Dynamic Type / font scale). Line heights leave room for Cyrillic and accents.
 */
export const textStyles = {
  /** Screen titles ("Practice", "Pratique", "Практика"). */
  display: {
    family: 'serif',
    fontSize: 40,
    lineHeight: 48,
    weight: 'medium',
    fontVariant: ['lining-nums'],
  },
  /** Hero and cover titles. */
  title1: {
    family: 'serif',
    fontSize: 30,
    lineHeight: 36,
    weight: 'semibold',
    fontVariant: ['lining-nums'],
  },
  /** Section titles. */
  title2: {
    family: 'serif',
    fontSize: 24,
    lineHeight: 30,
    weight: 'semibold',
    fontVariant: ['lining-nums'],
  },
  headline: { family: 'sans', fontSize: 17, lineHeight: 23, weight: 'semibold' },
  body: { family: 'sans', fontSize: 16, lineHeight: 24, weight: 'regular' },
  bodyStrong: { family: 'sans', fontSize: 16, lineHeight: 24, weight: 'semibold' },
  callout: { family: 'sans', fontSize: 15, lineHeight: 21, weight: 'medium' },
  footnote: { family: 'sans', fontSize: 13, lineHeight: 18, weight: 'regular' },
  caption: { family: 'sans', fontSize: 12, lineHeight: 16, weight: 'medium' },
  /** Context above a title: date, city, week. Uppercase, tracked. */
  kicker: {
    family: 'sans',
    fontSize: 12,
    lineHeight: 16,
    weight: 'semibold',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  /** Large numerals: class times, timers, progress. */
  numeral: {
    family: 'serif',
    fontSize: 48,
    lineHeight: 58,
    weight: 'medium',
    fontVariant: ['lining-nums', 'tabular-nums'],
  },
  numeralSmall: {
    family: 'serif',
    fontSize: 28,
    lineHeight: 34,
    weight: 'medium',
    fontVariant: ['lining-nums', 'tabular-nums'],
  },
} as const satisfies Record<string, TextStyleToken>;

export type TextStyleName = keyof typeof textStyles;
