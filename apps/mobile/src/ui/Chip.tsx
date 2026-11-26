import { colors, radii, spacing, touchTarget } from '@oreva/tokens';
import { StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { PressableScale, type PressableScaleProps } from './PressableScale';

export interface ChipProps extends Omit<PressableScaleProps, 'children' | 'style'> {
  label: string;
  selected?: boolean;
  /** Pill on the editorial screens (Today); square on the printed ones. */
  shape?: 'square' | 'pill';
}

/**
 * Filter chip. Selected: lilac with an iris edge and a heavier label (never
 * color alone), announced to screen readers. Unselected: paper with a 3:1 edge.
 */
export function Chip({ label, selected = false, shape = 'square', ...rest }: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      haptic="selection"
      style={[
        styles.base,
        shape === 'pill' && styles.pill,
        selected ? styles.selected : styles.unselected,
      ]}
      {...rest}
    >
      <AppText variant="callout" weight={selected ? 'bold' : 'medium'} numberOfLines={1}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget.min,
    paddingHorizontal: spacing.md,
    borderRadius: radii.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    borderRadius: radii.pill,
  },
  selected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.progress,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderControl,
  },
});
