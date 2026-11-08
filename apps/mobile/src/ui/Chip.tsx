import { colors, radii, spacing, touchTarget } from '@oreva/tokens';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { AppText } from './AppText';

export interface ChipProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  selected?: boolean;
}

/**
 * Filter chip. Selection is shown with fill AND weight (not color alone) and is
 * announced to screen readers. Unselected chips have a 3:1 boundary.
 */
export function Chip({ label, selected = false, ...rest }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
      {...rest}
    >
      <AppText variant="callout" weight={selected ? 'bold' : 'medium'} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget.min,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.accent,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderControl,
  },
  pressed: {
    opacity: 0.85,
  },
});
