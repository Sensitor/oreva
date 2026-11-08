import { describe, expect, it } from 'vitest';
import { colors, contrastPairs } from './colors';
import { AA_MINIMUM, contrastRatio } from './contrast';
import { palette } from './palette';
import { textStyles } from './typography';
import { spacing } from './layout';

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
  it('white on the reference accent fails', () => {
    expect(contrastRatio('#FFFFFF', palette.lavender[500])).toBeLessThan(AA_MINIMUM.nonText);
  });
  it('lavender accent as text fails', () => {
    expect(contrastRatio(palette.lavender[500], colors.background)).toBeLessThan(AA_MINIMUM.text);
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
});

describe('cssVariables', () => {
  it('exposes semantic colors to the web portal', async () => {
    const { cssVariables, cssVariablesRule } = await import('./css');
    const vars = cssVariables();
    expect(vars['--oreva-color-accent']).toBe(colors.accent);
    expect(vars['--oreva-color-text-primary']).toBe(colors.textPrimary);
    expect(vars['--oreva-radius-lg']).toBe('28px');
    expect(cssVariablesRule().startsWith(':root{')).toBe(true);
  });
});
