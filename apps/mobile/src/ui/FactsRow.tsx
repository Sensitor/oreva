import { colors, spacing } from '@oreva/tokens';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';

export interface Fact {
  label: string;
  value: string;
}

export interface FactsRowProps {
  facts: readonly Fact[];
  testID?: string;
}

/**
 * Key facts side by side, separated by hairlines (duration, level, languages).
 * Replaces the coloured stat tiles. Each fact is read as "label, value".
 * Wraps to a new line when the text is large.
 */
export function FactsRow({ facts, testID }: FactsRowProps) {
  return (
    <View style={styles.row} testID={testID}>
      {facts.map((fact, index) => (
        <View
          key={fact.label}
          style={[styles.fact, index > 0 && styles.divided]}
          accessible
          accessibilityLabel={`${fact.label}, ${fact.value}`}
        >
          <AppText variant="caption" weight="semibold" color="textSecondary" style={styles.label}>
            {fact.label}
          </AppText>
          <AppText variant="bodyStrong" color="textBrand">
            {fact.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  fact: {
    flexGrow: 1,
    flexBasis: 88,
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  // Uppercase with light tracking: long labels ("Spécialités") fit a third of the row.
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  divided: {
    borderStartWidth: StyleSheet.hairlineWidth,
    borderStartColor: colors.borderSubtle,
  },
});
