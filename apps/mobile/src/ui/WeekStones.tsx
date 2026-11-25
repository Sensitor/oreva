import { colors, spacing } from '@oreva/tokens';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { CutShape } from './CutShape';

export interface WeekStonesProps {
  /** Seven days, Monday first: true when a session was finished that day. */
  days: readonly boolean[];
  /** Seven short day names in the member's language. */
  labels: readonly string[];
  /** Spoken summary, e.g. "This week: 1 session". */
  accessibilityLabel: string;
  testID?: string;
}

/**
 * The week as seven cut-paper stones: empty outlines, filled for each day a
 * session was finished on this phone. Never an invented number.
 */
export function WeekStones({ days, labels, accessibilityLabel, testID }: WeekStonesProps) {
  return (
    <View style={styles.row} accessible accessibilityLabel={accessibilityLabel} testID={testID}>
      {days.slice(0, 7).map((done, i) => (
        <View key={i} style={styles.day}>
          <CutShape
            shape="pebble"
            size={34}
            color={done ? colors.actionPrimary : colors.borderControl}
            outline={!done}
            rotate={(i % 3) * 7 - 7}
            delay={i * 40}
            animate={done}
            testID={done ? 'stone-done' : 'stone-empty'}
          />
          <AppText variant="caption" weight="semibold" color="textSecondary">
            {labels[i] ?? ''}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
