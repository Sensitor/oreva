import { typefaces, type FontWeightName, type TypefaceName } from '@oreva/tokens';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface ThemeContextValue {
  /** Font family for a weight: Manrope by default, Cormorant Garamond with `serif`. */
  fontFamily: (weight: FontWeightName, family?: TypefaceName) => string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ThemeContextValue>(
    () => ({
      fontFamily: (weight, family = 'sans') => typefaces[family][weight],
    }),
    [],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return value;
}
