import { colors, elevation, radii, spacing, type ColorToken } from '@oreva/tokens';
import { StyleSheet, View, type ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  tone?: Extract<
    ColorToken,
    'surface' | 'tileMint' | 'tileViolet' | 'tileOrchid' | 'accentStrong' | 'backgroundTint'
  >;
  padded?: boolean;
}

/** Rounded card (radius 28) with soft depth. */
export function Card({ tone = 'surface', padded = true, style, ...rest }: CardProps) {
  return (
    <View
      style={[styles.base, { backgroundColor: colors[tone] }, padded && styles.padded, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    boxShadow: elevation.soft,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg - 4,
  },
});
