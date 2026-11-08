/**
 * Pseudo-localisation for layout testing: accents every letter and pads strings
 * by about 35%, which is longer than our Russian and French copy. Development
 * builds can switch to it to find truncation and hardcoded text. Never shipped
 * to members and never counted as a supported language.
 */
const ACCENTED: Record<string, string> = {
  a: 'à',
  e: 'é',
  i: 'ï',
  o: 'ö',
  u: 'ü',
  y: 'ÿ',
  c: 'ç',
  n: 'ñ',
  A: 'À',
  E: 'É',
  I: 'Ï',
  O: 'Ö',
  U: 'Ü',
  Y: 'Ÿ',
  C: 'Ç',
  N: 'Ñ',
};

export function pseudoLocalizeString(value: string): string {
  // Keep {{placeholders}} untouched.
  const parts = value.split(/(\{\{[^}]+\}\})/g);
  const transformed = parts
    .map((part) =>
      part.startsWith('{{') ? part : part.replace(/[a-zA-Z]/g, (ch) => ACCENTED[ch] ?? ch),
    )
    .join('');
  const padding = '·'.repeat(Math.ceil(value.length * 0.35));
  return `⟦${transformed}${padding}⟧`;
}

export function pseudoLocalize<T>(tree: T): T {
  if (typeof tree === 'string') {
    return pseudoLocalizeString(tree) as T;
  }
  if (tree && typeof tree === 'object') {
    return Object.fromEntries(
      Object.entries(tree as Record<string, unknown>).map(([key, value]) => [
        key,
        pseudoLocalize(value),
      ]),
    ) as T;
  }
  return tree;
}
