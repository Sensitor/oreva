import { colors, motion, tints, type TintName } from '@oreva/tokens';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { useReduceMotion } from '@/theme/useReduceMotion';

const ease = Easing.bezier(...motion.easing.out);
/** Tone on tone: the plum letter barely darker than the tint it sits on. */
const GLYPH_OPACITY = 0.1;

export interface TypeHeroProps {
  /** The partner's own tint (sand, lilac, mist): never a photograph (decision C-8). */
  tone: TintName;
  height: number;
  scrollY: SharedValue<number>;
  /** A very large serif letter, cut by the panel's edge. Decorative. */
  glyph?: string;
  /** Real content laid on the panel (a class's time), above the sheet's edge. */
  children?: ReactNode;
  testID?: string;
}

/**
 * The hero of a partner's page (a studio, an instructor, a class). Partners
 * never wear a stock photograph, so the page opens on a solid panel in their
 * tint with a very large serif initial, tone on tone, like a drop cap. The
 * letter settles as the page opens and moves at a third of the scroll speed.
 * With Reduce Motion it stays still.
 */
export function TypeHero({ tone, height, scrollY, glyph, children, testID }: TypeHeroProps) {
  const reduceMotion = useReduceMotion();
  const { fontFamily } = useTheme();
  const settle = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    settle.value = reduceMotion ? 1 : withTiming(1, { duration: motion.settle, easing: ease });
  }, [reduceMotion, settle]);

  const depth = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: GLYPH_OPACITY, transform: [{ translateY: 0 }] };
    }
    const y = scrollY.value;
    return {
      opacity: GLYPH_OPACITY * settle.value,
      transform: [{ translateY: (1 - settle.value) * 24 + (y > 0 ? y * motion.parallax : y / 2) }],
    };
  });

  return (
    <View style={[styles.panel, { height, backgroundColor: tints[tone] }]} testID={testID}>
      {glyph ? (
        <Animated.Text
          style={[
            styles.glyph,
            {
              fontFamily: fontFamily('medium', 'serif'),
              fontSize: height * 1.05,
              lineHeight: height * 1.1,
            },
            depth,
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          allowFontScaling={false}
          numberOfLines={1}
        >
          {glyph}
        </Animated.Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    overflow: 'hidden',
  },
  glyph: {
    position: 'absolute',
    end: -12,
    bottom: -40,
    color: colors.textBrand,
  },
});
