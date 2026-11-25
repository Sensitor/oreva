import { colors, spacing } from '@oreva/tokens';
import { StyleSheet, View } from 'react-native';
import Svg, { Line as SvgLine } from 'react-native-svg';
import { AppText } from './AppText';

export interface Fact {
  label: string;
  value: string;
}

export interface FactListProps {
  facts: readonly Fact[];
  /** On the plum block, the text and leaders turn paper. */
  onPlum?: boolean;
  testID?: string;
}

/**
 * Facts as on a printed programme: label, a dotted leader, value. Each line is
 * read as "label, value". Long values wrap under large text.
 */
export function FactList({ facts, onPlum = false, testID }: FactListProps) {
  return (
    <View style={styles.list} testID={testID}>
      {facts.map((fact) => (
        <View
          key={fact.label}
          style={styles.row}
          accessible
          accessibilityLabel={`${fact.label}, ${fact.value}`}
        >
          <AppText variant="callout" color={onPlum ? 'textOnAccentStrong' : 'textSecondary'}>
            {fact.label}
          </AppText>
          <View style={styles.leader} accessibilityElementsHidden importantForAccessibility="no">
            <Svg width="100%" height={4}>
              <SvgLine
                x1="2"
                y1="2"
                x2="100%"
                y2="2"
                stroke={onPlum ? colors.textOnAccentStrong : colors.borderControl}
                strokeWidth={1.5}
                strokeDasharray="0.1 5"
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <AppText
            variant="callout"
            weight="semibold"
            color={onPlum ? 'textOnAccentStrong' : 'textPrimary'}
            style={styles.value}
          >
            {fact.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  leader: {
    flex: 1,
    minWidth: spacing.md,
    marginBottom: 5,
  },
  value: {
    flexShrink: 1,
  },
});
