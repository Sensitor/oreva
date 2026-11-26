import { motion } from '@oreva/tokens';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  withDelay,
  withSpring,
  withTiming,
  type EntryExitAnimationFunction,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/theme/useReduceMotion';

/** Only the first blocks of a screen enter; the rest is simply there. */
const MAX_STAGGERED = 5;
/** Time between two blocks entering. */
const STEP = 70;
const ease = Easing.bezier(...motion.easing.out);

/** A block fades in and rises 14 pt on a spring that does not bounce. */
export function rise(delay: number): EntryExitAnimationFunction {
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateY: motion.rise }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration: motion.enter, easing: ease })),
        transform: [{ translateY: withDelay(delay, withSpring(0, motion.springs.gentle)) }],
      },
    };
  };
}

export interface EnterProps {
  /** Position on the screen, from the top. */
  index?: number;
  /** Extra wait before the first block, e.g. while the hero settles. */
  after?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Screen entrance on the editorial screens: blocks fade in and rise, 70 ms
 * apart, first five only. Under half a second in all; nothing waits for it.
 * With Reduce Motion the blocks are simply shown.
 */
export function Enter({ index = 0, after = 0, children, style }: EnterProps) {
  const reduceMotion = useReduceMotion();
  const entering = reduceMotion || index >= MAX_STAGGERED ? undefined : rise(after + index * STEP);
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
