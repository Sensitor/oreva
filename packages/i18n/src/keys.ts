/** Flattens a nested translation tree into dotted keys: { a: { b: "x" } } -> { "a.b": "x" }. */
export function flattenKeys(tree: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  if (tree && typeof tree === 'object') {
    for (const [key, value] of Object.entries(tree as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        out[path] = value;
      } else {
        Object.assign(out, flattenKeys(value, path));
      }
    }
  }
  return out;
}

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

/** "home.today.exercises_one" -> "home.today.exercises" */
export function pluralBase(key: string): string | null {
  return PLURAL_SUFFIX.test(key) ? key.replace(PLURAL_SUFFIX, '') : null;
}

/** Interpolation variables used in a string: "Day {{day}}" -> ["day"]. */
export function interpolationVariables(value: string): string[] {
  return [...value.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)].map((m) => m[1] ?? '').sort();
}
