import { describe, expect, it } from 'vitest';
import { colors, contrastPairs } from './colors';
import { AA_MINIMUM, contrastRatio } from './contrast';
import { palette } from './palette';
import { SERIF_MIN_SIZE, textStyles, typefaces } from './typography';
import { motion, radii, spacing } from './layout';
import { voileTextColor, voiles } from './voile';

describe('contrastRatio', () => {
  it('matches known WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
  });

  it('rejects malformed colors', () => {
    expect(() => contrastRatio('lavender', '#FFFFFF')).toThrow();
  });
});

describe('semantic color pairs meet WCAG 2.2 AA', () => {
  it.each(
    contrastPairs.map(
      (pair) => [`${pair.foreground} on ${pair.background} (${pair.usage})`, pair] as const,
    ),
  )('%s', (_label, pair) => {
    const ratio = contrastRatio(colors[pair.foreground], colors[pair.background]);
    expect(ratio).toBeGreaterThanOrEqual(AA_MINIMUM[pair.kind]);
  });
});

describe('known failures from the visual reference stay documented', () => {
  // These pairings appear in the reference but fail AA. They must never be added
  // to contrastPairs; this test keeps the reasoning visible.
  it('white on the moodboard lavender fails (text on lavender is ink)', () => {
    expect(contrastRatio('#FFFFFF', palette.lavender[400])).toBeLessThan(AA_MINIMUM.nonText);
  });
  it('lavender as text fails on cream', () => {
    expect(contrastRatio(palette.lavender[400], colors.background)).toBeLessThan(AA_MINIMUM.text);
  });
  it('lavender lines fail on cream, which is why progress uses iris', () => {
    expect(contrastRatio(palette.lavender[400], colors.background)).toBeLessThan(
      AA_MINIMUM.nonText,
    );
    expect(contrastRatio(colors.progress, colors.background)).toBeGreaterThanOrEqual(
      AA_MINIMUM.nonText,
    );
  });
});

describe('scales', () => {
  it('spacing follows the 4-point grid', () => {
    for (const value of Object.values(spacing)) {
      expect(value % 4).toBe(0);
    }
  });

  it('line heights leave room for accents and Cyrillic (>= 1.2x)', () => {
    for (const style of Object.values(textStyles)) {
      expect(style.lineHeight / style.fontSize).toBeGreaterThanOrEqual(1.2);
    }
  });

  it('body text is at least 16pt', () => {
    expect(textStyles.body.fontSize).toBeGreaterThanOrEqual(16);
  });

  it('the serif is only used for titles and numerals, from 22pt', () => {
    for (const [name, style] of Object.entries(textStyles)) {
      if (style.family === 'serif') {
        expect({ name, size: style.fontSize >= SERIF_MIN_SIZE }).toEqual({ name, size: true });
      }
    }
    expect(textStyles.body.family).toBe('sans');
  });

  it('serif styles use lining figures, so "Day 1" never reads "Day I"', () => {
    for (const style of Object.values(textStyles)) {
      if (style.family === 'serif') {
        expect('fontVariant' in style && style.fontVariant).toContain('lining-nums');
      }
    }
  });

  it('every style uses a bundled typeface and weight', () => {
    for (const style of Object.values(textStyles)) {
      expect(typefaces[style.family][style.weight]).toMatch(/^(Manrope|CormorantGaramond)_/);
    }
  });

  it('radii contrast content and actions', () => {
    expect(radii.md).toBeLessThan(radii.lg);
    expect(radii.pill).toBeGreaterThan(100);
  });

  it('motion stays short and soft', () => {
    expect(motion.duration.fast).toBeLessThanOrEqual(150);
    expect(motion.duration.entrance).toBeLessThanOrEqual(300);
    expect(motion.pressScale).toBeGreaterThan(0.95);
  });
});

describe('approved palette (24 Nov 2026)', () => {
  it('keeps the moodboard colours', () => {
    expect(palette.plum[700]).toBe('#4B365D');
    expect(palette.lavender[400]).toBe('#A78BC6');
    expect(palette.lavender[100]).toBe('#E7DDF4');
    expect(palette.cream[100]).toBe('#F7F3EE');
    expect(palette.cream[200]).toBe('#E9E1D7');
  });

  it('has no mint or orchid any more', () => {
    expect(Object.keys(palette)).not.toContain('mint');
    expect(Object.keys(palette)).not.toContain('orchid');
  });
});

describe('cssVariables', () => {
  it('exposes semantic colors to the web portal', async () => {
    const { cssVariables, cssVariablesRule } = await import('./css');
    const vars = cssVariables();
    expect(vars['--oreva-color-accent']).toBe(colors.accent);
    expect(vars['--oreva-color-text-primary']).toBe(colors.textPrimary);
    expect(vars['--oreva-radius-lg']).toBe('22px');
    expect(cssVariablesRule().startsWith(':root{')).toBe(true);
  });
});

describe('voile', () => {
  it.each(Object.entries(voiles))(
    'keeps text readable at every stop of the %s voile',
    (_name, voile) => {
      for (const stop of voile.stops) {
        expect(contrastRatio(colors[voile.text], stop)).toBeGreaterThanOrEqual(AA_MINIMUM.text);
        expect(contrastRatio(colors[voile.meta], stop)).toBeGreaterThanOrEqual(AA_MINIMUM.text);
      }
    },
  );

  it('uses only palette colors, all opaque', () => {
    const paletteHex = new Set(
      Object.values(palette).flatMap((shades) => Object.values(shades as Record<string, string>)),
    );
    for (const voile of Object.values(voiles)) {
      for (const stop of voile.stops) {
        expect(paletteHex.has(stop)).toBe(true);
        expect(stop).toMatch(/^#[0-9A-F]{6}$/i);
      }
    }
  });

  it('resolves text colors', () => {
    expect(voileTextColor('plum')).toBe(colors.textOnAccentStrong);
    expect(voileTextColor('lilac', 'meta')).toBe(colors.textOnPastelSecondary);
  });
});
