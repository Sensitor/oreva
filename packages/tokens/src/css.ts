import { colors } from './colors';
import { radii, spacing } from './layout';

function kebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * The semantic tokens as CSS custom properties, for the web portal. Keeps one
 * source of truth: the web never redefines colors by hand.
 */
export function cssVariables(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries(colors)) {
    vars[`--oreva-color-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(spacing)) {
    vars[`--oreva-space-${name}`] = `${value}px`;
  }
  for (const [name, value] of Object.entries(radii)) {
    vars[`--oreva-radius-${name}`] = `${value}px`;
  }
  return vars;
}

/** Same as `cssVariables`, serialised as a `:root { ... }` rule. */
export function cssVariablesRule(): string {
  const body = Object.entries(cssVariables())
    .map(([key, value]) => `${key}:${value}`)
    .join(';');
  return `:root{${body}}`;
}
