import { colors, radii, spacing, tints, type TintName } from '@oreva/tokens';
import { StyleSheet, View, type ViewProps } from 'react-native';

export type CardTone = TintName | 'surface' | 'accentStrong' | 'backgroundTint';

export interface CardProps extends ViewProps {
  tone?: CardTone;
  padded?: boolean;
}

export function toneColor(tone: CardTone): string {
  return tone in tints ? tints[tone as TintName] : colors[tone as Exclude<CardTone, TintName>];
}

/**
 * Card: separated by tone and a hairline, not by shadow (design direction).
 * Paper cards get a hairline edge; tinted and plum cards stand on their color.
 */
export function Card({ tone = 'surface', padded = true, style, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: toneColor(tone) },
        tone === 'surface' && styles.hairline,
        padded && styles.padded,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  hairline: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  padded: {
    padding: spacing.gutter,
  },
});
