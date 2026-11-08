/// <reference types="node" />
import { describe, expect, it } from '@jest/globals';
import { flattenKeys, pluralBase, resources } from '@oreva/i18n';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * Every literal key used with t('...') in the app must exist in English (and
 * therefore, through the parity test, in French and Russian). Dynamic keys
 * (template strings) are checked by the screen tests instead.
 */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      return name === '__tests__' ? [] : sourceFiles(full);
    }
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe('translation keys used in code', () => {
  const english = flattenKeys(resources.en.translation);
  const known = new Set<string>([
    ...Object.keys(english),
    ...Object.keys(english).map((k) => pluralBase(k) ?? k),
  ]);

  it('all exist in the English source file', () => {
    const missing: string[] = [];
    for (const file of sourceFiles(path.resolve(__dirname, '..'))) {
      const content = readFileSync(file, 'utf8');
      for (const match of content.matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) {
        const key = match[1] ?? '';
        if (!known.has(key)) {
          missing.push(`${path.basename(file)}: ${key}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
