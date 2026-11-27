import { colors, motion, radii, spacing } from '@oreva/tokens';
import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  withDelay,
  withSpring,
  withTiming,
  type EntryExitAnimationFunction,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { AppText } from '../AppText';

const RING = 36;
const STEP = 60;
const ease = Easing.bezier(...motion.easing.out);

/** A finished day fills in: it fades in and grows from 60% on a spring with no bounce. */
function fill(delay: number): EntryExitAnimationFunction {
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ scale: 0.6 }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration: motion.enter, easing: ease })),
        transform: [{ scale: withDelay(delay, withSpring(1, motion.springs.gentle)) }],
      },
    };
  };
}

export interface WeekRingsProps {
  /** Seven days, Monday first: true when a session was finished that day. */
  days: readonly boolean[];
  /** Seven short day names in the member's language. */
  labels: readonly string[];
  /** Index of today (0 = Monday), ringed in iris until a session fills it. */
  today: number;
  /**
   * Spoken summary, e.g. "0 sessions this week". Leave it out when the same
   * count is said next to the week: the rings are then decorative.
   */
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * The member's week (editorial direction): seven rings under the day
 * initials. A day with a session finished on this phone fills in iris with a
 * check; today is ringed in iris; the other days are fine outlines. Never an
 * invented number. Read as one sentence. With Reduce Motion the days are
 * simply filled.
 */
export function WeekRings({ days, labels, today, accessibilityLabel, testID }: WeekRingsProps) {
  const reduceMotion = useReduceMotion();
  let filled = 0;
  return (
    <View
      style={styles.row}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={!accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
      testID={testID}
    >
      {days.slice(0, 7).map((done, i) => {
        const order = done ? filled++ : 0;
        return (
          <View key={i} style={styles.day}>
            <AppText
              variant="caption"
              weight={i === today ? 'bold' : 'semibold'}
              color={i === today ? 'textBrand' : 'textSecondary'}
            >
              {labels[i] ?? ''}
            </AppText>
            <View
              style={[styles.ring, i === today && !done && styles.today]}
              testID={done ? 'day-done' : i === today ? 'day-today' : 'day-empty'}
            >
              {done ? (
                <Animated.View
                  entering={reduceMotion ? undefined : fill(200 + order * STEP)}
                  style={styles.fill}
                >
                  <Check size={16} color={colors.textOnAction} strokeWidth={2.25} />
                </Animated.View>
              ) : null}
            </View>
          </View>
        );
      })}
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
    gap: spacing.xs,
  },
  ring: {
    width: RING,
    height: RING,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderControl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: {
    borderWidth: 1.5,
    borderColor: colors.progress,
  },
  fill: {
    position: 'absolute',
    top: -1,
    start: -1,
    width: RING,
    height: RING,
    borderRadius: radii.pill,
    backgroundColor: colors.progress,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
