import { colors, spacing } from '@oreva/tokens';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';

export interface InfoRowProps {
  icon: LucideIcon;
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
      <Icon size={20} color={colors.textSecondary} strokeWidth={1.75} />
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
    paddingVertical: spacing.xs,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
