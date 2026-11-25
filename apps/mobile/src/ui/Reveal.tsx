import { motion } from '@oreva/tokens';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { easing, useNativeDriver } from '@/theme/motion';
import { useReduceMotion } from '@/theme/useReduceMotion';

/** Only the first sections of a screen enter; the rest is simply there. */
const MAX_STAGGERED = 5;
const RISE = 8;

export interface RevealProps {
  /** Position on the screen: each step waits a little longer. */
  index?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Screen entrance (phase D): a section fades in and rises 8 pt, 240 ms,
 * 40 ms apart, first five only. With Reduce Motion it is simply shown.
 */
export function Reveal({ index = 0, children, style }: RevealProps) {
  const reduceMotion = useReduceMotion();
  const still = reduceMotion || index >= MAX_STAGGERED;
  const [progress] = useState(() => new Animated.Value(still ? 1 : 0));

  useEffect(() => {
    if (still) {
      progress.setValue(1);
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: motion.duration.entrance,
      delay: index * motion.stagger,
      easing: easing.out,
      useNativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [still, index, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [RISE, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
