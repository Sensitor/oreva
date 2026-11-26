import { colors, motion, radii, spacing } from '@oreva/tokens';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/theme/useReduceMotion';

const ease = Easing.bezier(...motion.easing.out);

/**
 * A fine progress thread: it grows to the real value in 600 ms when it
 * appears; with Reduce Motion it is drawn at its value.
 */
export function ProgressThread({ value, label }: { value: number; label: string }) {
  const reduceMotion = useReduceMotion();
  const clamped = Math.min(Math.max(value, 0), 1);
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(reduceMotion ? clamped : 0);

  useEffect(() => {
    progress.value = reduceMotion
      ? clamped
      : withDelay(200, withTiming(clamped, { duration: motion.duration.progress, easing: ease }));
  }, [clamped, reduceMotion, progress]);

  const fill = useAnimatedStyle(() => ({ width: width * progress.value }));
  return (
    <View
      style={styles.thread}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View style={[styles.threadFill, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  thread: {
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.borderSubtle,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  threadFill: {
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.progress,
  },
});
