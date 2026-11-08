import {
  colors,
  textStyles,
  type ColorToken,
  type FontWeightName,
  type TextStyleName,
} from '@oreva/tokens';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface AppTextProps extends TextProps {
  variant?: TextStyleName;
  color?: ColorToken;
  weight?: FontWeightName;
  align?: 'auto' | 'left' | 'center' | 'right' | 'justify';
}

/**
 * The only text component screens should use. It applies the type scale and the
 * chosen typeface, and keeps system text scaling on (Dynamic Type / font scale).
 */
export function AppText({
  variant = 'body',
  color = 'textPrimary',
  weight,
  align,
  style,
  ...rest
}: AppTextProps) {
  const { fontFamily } = useTheme();
  const token = textStyles[variant];
  return (
    <Text
      maxFontSizeMultiplier={variant === 'display' || variant === 'title1' ? 1.6 : 2}
      {...rest}
      style={[
        styles.base,
        {
          fontFamily: fontFamily(weight ?? token.weight),
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          letterSpacing: 'letterSpacing' in token ? token.letterSpacing : 0,
          color: colors[color],
          textAlign: align,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    // Android adds extra top padding to custom fonts; keep metrics consistent across platforms.
    includeFontPadding: false,
  },
});
