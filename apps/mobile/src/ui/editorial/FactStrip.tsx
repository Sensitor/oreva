import { colors, spacing } from '@oreva/tokens';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../AppText';

export interface StripFact {
  label: string;
  value: string;
}

/**
 * Two to four facts side by side between two hairlines, like the credits of a
 * magazine spread: a small label, the value under it. Each fact is read as
 * "label, value".
 */
export function FactStrip({ facts, testID }: { facts: readonly StripFact[]; testID?: string }) {
  return (
    <View style={styles.strip} testID={testID}>
      {facts.map((fact, index) => (
        <View
          key={fact.label}
          style={[styles.fact, index > 0 && styles.divided]}
          accessible
          accessibilityLabel={`${fact.label}, ${fact.value}`}
        >
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {fact.label}
          </AppText>
          <AppText variant="callout" weight="semibold" numberOfLines={2}>
            {fact.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderControl,
    paddingVertical: spacing.sm,
  },
  fact: {
    flex: 1,
    gap: 2,
    paddingHorizontal: spacing.sm,
  },
  divided: {
    borderStartWidth: StyleSheet.hairlineWidth,
    borderStartColor: colors.borderSubtle,
  },
});
