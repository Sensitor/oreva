import { colors, spacing } from '@oreva/tokens';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { AppText } from './AppText';
import type { IconComponent } from './icons';

interface BaseRowProps {
  icon?: IconComponent;
  label: string;
  hint?: string;
  testID?: string;
}

export interface LinkRowProps extends BaseRowProps {
  value?: string;
  onPress: () => void;
}

/** A plain line icon: no tinted circle, the row stays quiet. */
function RowIcon({ icon: Icon }: { icon: IconComponent }) {
  return (
    <View style={styles.icon}>
      <Icon size={22} color={colors.textBrand} strokeWidth={1.5} />
    </View>
  );
}

/** Settings row that opens another screen. */
export function LinkRow({ icon, label, hint, value, onPress, testID }: LinkRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityHint={hint}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {icon ? <RowIcon icon={icon} /> : null}
      <View style={styles.text}>
        <AppText variant="bodyStrong">{label}</AppText>
        {hint ? (
          <AppText variant="footnote" color="textSecondary">
            {hint}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="callout" color="textSecondary">
          {value}
        </AppText>
      ) : null}
      <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
    </Pressable>
  );
}

export interface ToggleRowProps extends BaseRowProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** Settings row with a switch. */
export function ToggleRow({ icon, label, hint, value, onValueChange, testID }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      {icon ? <RowIcon icon={icon} /> : null}
      <View style={styles.text}>
        <AppText variant="bodyStrong">{label}</AppText>
        {hint ? (
          <AppText variant="footnote" color="textSecondary">
            {hint}
          </AppText>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        testID={testID}
        trackColor={{ true: colors.progress, false: colors.borderControl }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.borderControl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  icon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
