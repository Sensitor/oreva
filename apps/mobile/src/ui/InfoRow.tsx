import { colors, spacing } from '@oreva/tokens';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import type { IconComponent } from './icons';

export interface InfoRowProps {
  icon: IconComponent;
  label: string;
  value: string;
  detail?: string;
}

/** Label/value row used on class and profile pages. */
export function InfoRow({ icon: Icon, label, value, detail }: InfoRowProps) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={[label, value, detail].filter(Boolean).join(', ')}
    >
      <Icon size={20} color={colors.textBrand} strokeWidth={1.5} />
      <View style={styles.text}>
        <AppText variant="footnote" color="textSecondary">
          {label}
        </AppText>
        <AppText variant="bodyStrong">{value}</AppText>
        {detail ? (
          <AppText variant="footnote" color="textSecondary">
            {detail}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
