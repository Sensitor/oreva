import { motion } from '@oreva/tokens';
import { useEffect, useState } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { easing, useNativeDriver } from '@/theme/motion';
import { useReduceMotion } from '@/theme/useReduceMotion';

/**
 * Cut paper (identity C-9): flat shapes cut by hand, slightly irregular, in
 * the spirit of the paper cut-outs made in Nice. Never a gradient, never a
 * copy of an artwork. Decorative: hidden from screen readers.
 */
const SHAPES = {
  sun: {
    viewBox: [120, 120],
    d: 'M60 6 C88 5 115 28 113 61 C111 92 87 116 57 114 C27 112 6 90 7 59 C8 30 31 7 60 6 Z',
  },
  leaf: {
    viewBox: [140, 90],
    d: 'M6 70 C22 30 64 6 118 8 C130 9 136 14 132 22 C112 58 74 84 26 86 C12 86 3 80 6 70 Z',
  },
  seed: {
    viewBox: [40, 60],
    d: 'M20 2 C32 10 38 30 34 46 C31 56 12 58 7 47 C2 34 8 12 20 2 Z',
  },
  pebble: {
    viewBox: [40, 44],
    d: 'M20 3 C33 4 38 16 36 27 C34 38 24 42 15 40 C6 38 2 28 4 18 C6 9 11 3 20 3 Z',
  },
} as const;

export type CutShapeName = keyof typeof SHAPES;

export interface CutShapeProps {
  shape: CutShapeName;
  /** Width in points; the height follows the shape. */
  size: number;
  color: string;
  /** Resting angle in degrees. */
  rotate?: number;
  /** Draw the outline only (an empty stone), instead of a filled shape. */
  outline?: boolean;
  /** Settle in after this delay (ms), like paper laid on a table. */
  delay?: number;
  /** Play the settle animation. Off for shapes that change often. */
  animate?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function CutShape({
  shape,
  size,
  color,
  rotate = 0,
  outline = false,
  delay = 0,
  animate = true,
  style,
  testID,
}: CutShapeProps) {
  const reduceMotion = useReduceMotion();
  const still = reduceMotion || !animate;
  const [progress] = useState(() => new Animated.Value(still ? 1 : 0));

  useEffect(() => {
    if (still) {
      progress.setValue(1);
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: motion.duration.slow,
      delay,
      easing: easing.out,
      useNativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [still, delay, progress]);

  const { viewBox, d } = SHAPES[shape];
  const [w, h] = viewBox;
  const height = (size * h) / w;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
      style={[
        { width: size, height },
        {
          opacity: progress,
          transform: [
            {
              rotate: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [`${String(rotate - 8)}deg`, `${String(rotate)}deg`],
              }),
            },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
          ],
        },
        style,
      ]}
    >
      <Svg width={size} height={height} viewBox={`0 0 ${String(w)} ${String(h)}`}>
        <Path
          d={d}
          fill={outline ? 'none' : color}
          stroke={outline ? color : 'none'}
          strokeWidth={outline ? 1.5 : 0}
        />
      </Svg>
    </Animated.View>
  );
}
