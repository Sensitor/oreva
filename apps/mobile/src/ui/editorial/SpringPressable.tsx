import { motion } from '@oreva/tokens';
import type { ReactNode } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { haptics, type HapticKind } from '@/theme/haptics';
import { useReduceMotion } from '@/theme/useReduceMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface SpringPressableProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  haptic?: HapticKind;
  /** How far it gives under the finger (0.97 for cards, 0.96 for buttons). */
  pressedScale?: number;
}

/**
 * Press feedback on the editorial screens: the surface gives under the finger
 * on a firm spring and comes back the instant it is released, on the UI
 * thread. With Reduce Motion: a slight dim, no movement.
 */
export function SpringPressable({
  style,
  children,
  haptic,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: SpringPressableProps) {
  const reduceMotion = useReduceMotion();
  const pressed = useSharedValue(0);

  const animated = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: 1 - pressed.value * 0.2 }
      : { transform: [{ scale: 1 - (1 - pressedScale) * pressed.value }] },
  );

  return (
    <AnimatedPressable
      onPressIn={(event: GestureResponderEvent) => {
        pressed.value = reduceMotion
          ? withTiming(1, { duration: motion.duration.fast })
          : withSpring(1, motion.springs.press);
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        pressed.value = reduceMotion
          ? withTiming(0, { duration: motion.duration.fast })
          : withSpring(0, motion.springs.press);
        onPressOut?.(event);
      }}
      onPress={(event: GestureResponderEvent) => {
        if (haptic) {
          haptics[haptic]();
        }
        onPress?.(event);
      }}
      style={[style, animated]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
