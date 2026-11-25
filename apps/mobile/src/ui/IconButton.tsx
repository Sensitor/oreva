import { colors, elevation, radii, touchTarget } from '@oreva/tokens';
import { StyleSheet } from 'react-native';
import type { IconComponent } from './icons';
import { PressableScale, type PressableScaleProps } from './PressableScale';

export interface IconButtonProps extends Omit<PressableScaleProps, 'children' | 'style'> {
  icon: IconComponent;
  /** Required: icon-only buttons need a spoken label. */
  accessibilityLabel: string;
  /** Lifts the button with a shadow, for controls that float over a map or a photo. */
  floating?: boolean;
}

/** Square paper button with a hairline edge (back, notifications, near me). */
export function IconButton({ icon: Icon, floating, ...rest }: IconButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      hitSlop={4}
      style={[styles.base, floating && styles.floating]}
      {...rest}
    >
      <Icon size={22} color={colors.textPrimary} strokeWidth={1.5} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: touchTarget.comfortable + 4,
    height: touchTarget.comfortable + 4,
    borderRadius: radii.xs,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  floating: {
    boxShadow: elevation.floating,
  },
});
