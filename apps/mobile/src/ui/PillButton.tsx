import { colors, radii, spacing, touchTarget } from '@oreva/tokens';
import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { AppText } from './AppText';

type Tone = 'accent' | 'light' | 'quiet';

export interface PillButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  tone?: Tone;
  /** Shows the circular arrow from the visual reference. */
  withArrow?: boolean;
  fullWidth?: boolean;
}

const backgrounds: Record<Tone, string> = {
  accent: colors.accent,
  light: colors.surface,
  quiet: colors.surfaceMuted,
};

/** Primary pill button. Text on lavender is ink, never white (AA contrast). */
export function PillButton({
  label,
  tone = 'accent',
  withArrow,
  fullWidth,
  disabled,
  ...rest
}: PillButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rest.accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: backgrounds[tone] },
        tone !== 'accent' && styles.bordered,
        fullWidth && styles.fullWidth,
        withArrow && styles.withArrow,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...rest}
    >
      <AppText variant="bodyStrong" color="textPrimary" numberOfLines={1}>
        {label}
      </AppText>
      {withArrow ? (
        <View
          style={styles.arrow}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <ArrowRight size={20} color={colors.textOnAccent} strokeWidth={2} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget.comfortable,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
  },
  bordered: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.borderSubtle,
  },
  withArrow: {
    paddingEnd: spacing.xxs,
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
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
