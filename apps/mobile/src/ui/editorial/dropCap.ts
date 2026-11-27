/** Initial of a name for a hero's drop cap: "L'Atelier" gives "A". */
export function dropCap(name: string): string {
  const letter = name.replace(/^(l['’]|le |la |les |the )/i, '').match(/\p{L}/u)?.[0];
  return (letter ?? name.charAt(0)).toUpperCase();
}
