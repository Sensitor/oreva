import { motion } from '@oreva/tokens';
import { useState } from 'react';
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { haptics, type HapticKind } from '@/theme/haptics';
import { easing, useNativeDriver } from '@/theme/motion';
import { useReduceMotion } from '@/theme/useReduceMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Haptic on press. None by default: haptics stay rare. */
  haptic?: HapticKind;
}

/**
 * The press feedback every ORÉVA button and card shares: a soft scale to 0.98
 * (120 ms, eased). With Reduce Motion on, a slight dim instead of any motion.
 */
export function PressableScale({
  style,
  haptic,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const reduceMotion = useReduceMotion();
  const [scale] = useState(() => new Animated.Value(1));
  const [pressed, setPressed] = useState(false);

  const animateTo = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: motion.duration.fast,
      easing: easing.out,
      useNativeDriver,
    }).start();
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(event: GestureResponderEvent) => {
        setPressed(true);
        if (!reduceMotion) {
          animateTo(motion.pressScale);
        }
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        setPressed(false);
        if (!reduceMotion) {
          animateTo(1);
        }
        onPressOut?.(event);
      }}
      onPress={(event: GestureResponderEvent) => {
        if (haptic) {
          haptics[haptic]();
        }
        onPress?.(event);
      }}
      style={[style, { transform: [{ scale }] }, pressed && { opacity: reduceMotion ? 0.8 : 0.92 }]}
      {...rest}
    />
  );
}
