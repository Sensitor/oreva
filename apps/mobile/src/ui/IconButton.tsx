import { colors, elevation, radii, touchTarget } from '@oreva/tokens';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: LucideIcon;
  /** Required: icon-only buttons need a spoken label. */
  accessibilityLabel: string;
}

/** Round icon button with soft depth (back, notifications, music in the reference). */
export function IconButton({ icon: Icon, ...rest }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={4}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      {...rest}
    >
      <Icon size={22} color={colors.textPrimary} strokeWidth={1.75} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: touchTarget.comfortable + 4,
    height: touchTarget.comfortable + 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: elevation.soft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  pressed: {
    opacity: 0.8,
  },
});
