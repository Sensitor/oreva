import { colors, motion } from '@oreva/tokens';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { easing } from '@/theme/motion';
import { useReduceMotion } from '@/theme/useReduceMotion';

interface CommonProps {
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface UnderlineProps extends CommonProps {
  variant?: 'underline';
  /** Width of the rule, in points. */
  width?: number;
}

export interface TabLineProps extends CommonProps {
  variant: 'tab';
}

export interface ProgressLineProps extends CommonProps {
  variant: 'progress';
  /** 0 to 1. */
  value: number;
  /** Optional steps (exercises, days): a square for each, stamped once done. */
  steps?: number;
  /** Spoken label, e.g. "Program progress". */
  accessibilityLabel: string;
}

export type LineProps = UnderlineProps | TabLineProps | ProgressLineProps;

const STAMP = 10;

/**
 * The rule, as on a printed programme (identity C-9): a short straight rule
 * under a title or the active tab, and progress as a rule that fills, with a
 * square stamped for each step done. The fill grows to its value in 600 ms;
 * with Reduce Motion it is drawn at its value.
 */
export function Line(props: LineProps) {
  if (props.variant === 'progress') {
    return <ProgressRule {...props} />;
  }
  const tab = props.variant === 'tab';
  return (
    <View
      style={[
        tab ? styles.tab : { width: props.width ?? 32, height: 2 },
        { backgroundColor: props.color ?? colors.actionPrimary },
        props.style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={props.testID}
    />
  );
}

function ProgressRule({
  value,
  steps,
  accessibilityLabel,
  color,
  style,
  testID,
}: ProgressLineProps) {
  const reduceMotion = useReduceMotion();
  const clamped = Math.min(Math.max(value, 0), 1);
  const [fill] = useState(() => new Animated.Value(reduceMotion ? clamped : 0));

  useEffect(() => {
    if (reduceMotion) {
      fill.setValue(clamped);
      return undefined;
    }
    // Width cannot run on the native driver; one short animation is fine on JS.
    const animation = Animated.timing(fill, {
      toValue: clamped,
      duration: motion.duration.progress,
      easing: easing.out,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [clamped, reduceMotion, fill]);

  const count = steps && steps > 0 ? steps : 0;
  const ink = color ?? colors.actionPrimary;
  return (
    <View
      style={[styles.progress, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      testID={testID}
    >
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: ink,
              width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
        {Array.from({ length: count }, (_, i) => {
          // Square n sits where step n is complete, so nothing is stamped at 0%.
          const fraction = (i + 1) / count;
          const done = fraction <= clamped + 1e-6;
          return (
            <View
              key={i}
              testID={done ? 'line-step-done' : 'line-step-todo'}
              style={[
                styles.stamp,
                { start: `${String(fraction * 100)}%` },
                done ? { backgroundColor: ink, borderColor: ink } : styles.stampTodo,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    width: 20,
    height: 2,
  },
  progress: {
    height: STAMP + 4,
    justifyContent: 'center',
    paddingHorizontal: STAMP / 2,
    alignSelf: 'stretch',
  },
  track: {
    height: 1,
    backgroundColor: colors.borderControl,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    start: 0,
    height: 3,
  },
  stamp: {
    position: 'absolute',
    width: STAMP,
    height: STAMP,
    marginStart: -STAMP / 2,
    borderWidth: 1,
  },
  stampTodo: {
    backgroundColor: colors.surface,
    borderColor: colors.borderControl,
  },
});
