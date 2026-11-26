import { motion } from '@oreva/tokens';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { EditorialImage, type EditorialPhoto } from '@/ui/editorial';

const ease = Easing.bezier(...motion.easing.out);

export interface TodayHeroProps {
  photo: EditorialPhoto;
  height: number;
  /** The screen's scroll position, read on the UI thread. */
  scrollY: SharedValue<number>;
  /** Controls laid over the photograph (the bell). */
  children?: ReactNode;
}

/**
 * The Today photograph, edge to edge under the status bar. It settles from
 * 104% to 100% as the screen opens, moves at a third of the scroll speed
 * (depth), and grows when pulled down instead of showing a gap. All on the UI
 * thread. With Reduce Motion: a still photograph.
 */
export function TodayHero({ photo, height, scrollY, children }: TodayHeroProps) {
  const reduceMotion = useReduceMotion();
  const settle = useSharedValue(reduceMotion ? 1 : 1.04);

  useEffect(() => {
    settle.value = reduceMotion ? 1 : withTiming(1, { duration: motion.settle, easing: ease });
  }, [reduceMotion, settle]);

  const depth = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { transform: [{ translateY: 0 }, { scale: 1 }] };
    }
    const y = scrollY.value;
    const pull = y < 0 ? -y : 0;
    return {
      transform: [
        // Pulled down: stay pinned to the top and grow. Scrolled up: lag behind (depth).
        { translateY: y < 0 ? y / 2 : y * motion.parallax },
        { scale: settle.value * (1 + pull / height) },
      ],
    };
  });

  return (
    <View style={{ height }}>
      <Animated.View style={[StyleSheet.absoluteFill, depth]}>
        <EditorialImage
          photo={photo}
          style={StyleSheet.absoluteFill}
          priority="high"
          testID="today-hero"
        />
      </Animated.View>
      {children}
    </View>
  );
}
