import { colors, radii, spacing, touchTarget, type ColorToken } from '@oreva/tokens';
import { ArrowRight } from 'lucide-react-native';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { PressableScale, type PressableScaleProps } from './PressableScale';

/**
 * - primary: plum, cream label. The main action of a screen.
 * - secondary: plum outline on the page.
 * - paper: paper fill, ink label. For plum, tinted or photo backgrounds.
 * - accent: lavender, ink label (never white: 2.94:1). At most once per screen.
 * - quiet: sand fill, ink label.
 * - text: iris link with a hairline underline.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'paper' | 'accent' | 'quiet' | 'text';

export interface ButtonProps extends Omit<PressableScaleProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  /** An arrow after the label: this starts something. */
  withArrow?: boolean;
  fullWidth?: boolean;
  /** Pill on the editorial screens (Today); square on the printed ones. */
  shape?: 'square' | 'pill';
}

const looks: Record<ButtonVariant, { container: ViewStyle; label: ColorToken }> = {
  primary: { container: { backgroundColor: colors.actionPrimary }, label: 'textOnAction' },
  secondary: {
    container: { borderWidth: 1, borderColor: colors.actionPrimary },
    label: 'textBrand',
  },
  paper: {
    container: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
    },
    label: 'textPrimary',
  },
  accent: { container: { backgroundColor: colors.accent }, label: 'textOnAccent' },
  quiet: { container: { backgroundColor: colors.surfaceMuted }, label: 'textPrimary' },
  text: { container: {}, label: 'textLink' },
};

export function Button({
  label,
  variant = 'primary',
  withArrow,
  fullWidth,
  shape = 'square',
  disabled,
  haptic,
  ...rest
}: ButtonProps) {
  const look = looks[variant];
  const isText = variant === 'text';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={rest.accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={isText ? 12 : 4}
      haptic={haptic ?? (variant === 'primary' && !disabled ? 'light' : undefined)}
      style={[
        isText ? styles.text : styles.base,
        look.container,
        fullWidth && styles.fullWidth,
        shape === 'pill' && !isText && styles.pill,
        withArrow && styles.withArrow,
        disabled && styles.disabled,
      ]}
      {...rest}
    >
      <AppText
        variant={isText ? 'callout' : 'bodyStrong'}
        weight="semibold"
        color={look.label}
        numberOfLines={1}
        style={isText ? styles.underline : undefined}
      >
        {label}
      </AppText>
      {withArrow ? (
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <ArrowRight size={20} color={colors[look.label]} strokeWidth={1.5} />
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget.comfortable + 4,
    borderRadius: radii.xs,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
  },
  text: {
    minHeight: touchTarget.min,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  underline: {
    textDecorationLine: 'underline',
    textDecorationColor: colors.textLink,
  },
  withArrow: {
    gap: spacing.md,
  },
  // A full-width bar: label at the start, arrow at the end, like a printed ticket stub.
  pill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  disabled: {
    opacity: 0.45,
  },
});
