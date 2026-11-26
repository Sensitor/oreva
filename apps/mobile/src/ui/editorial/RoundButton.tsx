import { colors, elevation, radii } from '@oreva/tokens';
import { StyleSheet } from 'react-native';
import type { IconComponent } from '../icons';
import { SpringPressable } from './SpringPressable';

export interface RoundButtonProps {
  icon: IconComponent;
  /** Required: an icon-only button needs a spoken label. */
  accessibilityLabel: string;
  onPress: () => void;
  testID?: string;
}

/** A round paper button laid over a photograph (back, notifications), 44 pt. */
export function RoundButton({ icon: Icon, accessibilityLabel, onPress, testID }: RoundButtonProps) {
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.button}
      pressedScale={0.92}
      hitSlop={6}
      testID={testID}
    >
      <Icon size={20} color={colors.textPrimary} strokeWidth={1.5} />
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: elevation.raised,
  },
});
