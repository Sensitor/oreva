import { useWindowDimensions } from 'react-native';

/** The member's system text size multiplier (1 = default). */
export function useFontScale(): number {
  return useWindowDimensions().fontScale;
}
