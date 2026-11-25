import { colors, radii, spacing, touchTarget } from '@oreva/tokens';
import { StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { PressableScale, type PressableScaleProps } from './PressableScale';

export interface ChipProps extends Omit<PressableScaleProps, 'children' | 'style'> {
  label: string;
  selected?: boolean;
}

/**
 * Filter chip. Selected: lilac with an iris edge and a heavier label (never
 * color alone), announced to screen readers. Unselected: paper with a 3:1 edge.
 */
export function Chip({ label, selected = false, ...rest }: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      haptic="selection"
      style={[styles.base, selected ? styles.selected : styles.unselected]}
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
  selected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.progress,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderControl,
  },
});
