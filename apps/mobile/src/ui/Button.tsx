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
  /** The circular arrow that invites to start (Today card). */
  withArrow?: boolean;
  fullWidth?: boolean;
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
        <View
          style={styles.arrow}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <ArrowRight size={20} color={colors.textOnAccent} strokeWidth={1.75} />
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget.comfortable + 4,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
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
    paddingEnd: spacing.xxs + 2,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
});
