import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultTypeface, typefaces, type FontWeightName, type TypefaceName } from '@oreva/tokens';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isProduction } from '@/config/env';

const STORAGE_KEY = 'oreva.designPreview.typeface';

interface ThemeContextValue {
  typeface: TypefaceName;
  setTypeface: (name: TypefaceName) => void;
  fontFamily: (weight: FontWeightName) => string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [typeface, setTypefaceState] = useState<TypefaceName>(defaultTypeface);

  useEffect(() => {
    if (isProduction) {
      return;
    }
    // The typeface switch is a design-review convenience, stored on this device only.
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'manrope' || stored === 'onest') {
          setTypefaceState(stored);
        }
      })
      .catch(() => undefined);
  }, []);

  const setTypeface = useCallback((name: TypefaceName) => {
    setTypefaceState(name);
    AsyncStorage.setItem(STORAGE_KEY, name).catch(() => undefined);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      typeface,
      setTypeface,
      fontFamily: (weight) => typefaces[typeface][weight],
    }),
    [typeface, setTypeface],
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
