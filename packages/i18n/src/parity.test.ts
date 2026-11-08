/**
 * Translation completeness. Fails the build if French or Russian is missing a key,
 * a plural form required by that language, or an interpolation variable
 * (cahier des charges, Addendum B: "un test automatisé qui échoue si une clé manque").
 */
import { describe, expect, it } from 'vitest';
import { flattenKeys, interpolationVariables, pluralBase } from './keys';
import { SUPPORTED_LOCALES, type Locale } from './locales';
import { resources } from './resources';

interface Analysis {
  simple: Map<string, string>;
  plurals: Map<string, Map<string, string>>;
}

function analyse(locale: Locale): Analysis {
  const flat = flattenKeys(resources[locale].translation);
  const simple = new Map<string, string>();
  const plurals = new Map<string, Map<string, string>>();
  for (const [key, value] of Object.entries(flat)) {
    const base = pluralBase(key);
    if (base) {
      const forms = plurals.get(base) ?? new Map<string, string>();
      forms.set(key.slice(base.length + 1), value);
      plurals.set(base, forms);
    } else {
      simple.set(key, value);
    }
  }
  return { simple, plurals };
}

const reference = analyse('en');

describe.each(SUPPORTED_LOCALES.map((l) => [l]))('locale %s', (locale) => {
  const current = analyse(locale);
  const requiredForms = [...new Intl.PluralRules(locale).resolvedOptions().pluralCategories].sort();

  it('has exactly the same keys as English', () => {
    expect([...current.simple.keys()].sort()).toEqual([...reference.simple.keys()].sort());
    expect([...current.plurals.keys()].sort()).toEqual([...reference.plurals.keys()].sort());
  });

  it('has every plural form its language needs (CLDR via Intl.PluralRules), and no others', () => {
    for (const [base, forms] of current.plurals) {
      expect({ key: base, forms: [...forms.keys()].sort() }).toEqual({
        key: base,
        forms: requiredForms,
      });
    }
  });

  it('has no empty or untrimmed strings', () => {
    const all = [
      ...current.simple.values(),
      ...[...current.plurals.values()].flatMap((f) => [...f.values()]),
    ];
    for (const value of all) {
      expect(value.trim()).not.toBe('');
      expect(value).toBe(value.trim());
    }
  });

  it('uses the same interpolation variables as English', () => {
    for (const [key, value] of current.simple) {
      expect({ key, vars: interpolationVariables(value) }).toEqual({
        key,
        vars: interpolationVariables(reference.simple.get(key) ?? ''),
      });
    }
    for (const [base, forms] of current.plurals) {
      const expected = interpolationVariables(reference.plurals.get(base)?.get('other') ?? '');
      for (const [form, value] of forms) {
        // A language may drop {{count}} in a specific form, but never introduce unknown variables.
        const vars = interpolationVariables(value);
        expect({
          key: `${base}_${form}`,
          unknown: vars.filter((v) => !expected.includes(v)),
        }).toEqual({
          key: `${base}_${form}`,
          unknown: [],
        });
      }
    }
  });
});
