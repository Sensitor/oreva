import { colors, motion } from '@oreva/tokens';
import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Mask, Path } from 'react-native-svg';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { LA_LIGNE_BOX, LA_LIGNE_CENTRE, LA_LIGNE_LENGTH, LA_LIGNE_OUTLINE } from './laLignePath';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const ease = Easing.bezier(...motion.easing.out);
/** Drawing a signature takes a breath: under a second, once. */
const DRAW_DURATION = 900;

export interface LaLigneProps {
  width?: number;
  color?: string;
  /** Wait before drawing (ms), to follow the title it underlines. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * La Ligne, drawn by hand (see laLignePath.ts). It draws itself once, from
 * left to right, when it first appears; with Reduce Motion it is simply there.
 * Used sparingly: one per screen at most. Decorative, hidden from VoiceOver.
 */
export function LaLigne({
  width = 132,
  color = colors.progress,
  delay = 0,
  style,
  testID,
}: LaLigneProps) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(delay, withTiming(1, { duration: DRAW_DURATION, easing: ease }));
  }, [reduceMotion, delay, progress]);

  const reveal = useAnimatedProps(() => ({
    strokeDashoffset: LA_LIGNE_LENGTH * (1 - progress.value),
  }));

  const height = (width * LA_LIGNE_BOX.height) / LA_LIGNE_BOX.width;
  const maskId = testID ? `la-ligne-${testID}` : 'la-ligne';
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${String(LA_LIGNE_BOX.width)} ${String(LA_LIGNE_BOX.height)}`}
      style={style}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
    >
      <Defs>
        <Mask id={maskId} maskUnits="userSpaceOnUse">
          <AnimatedPath
            d={LA_LIGNE_CENTRE}
            stroke={colors.surface}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${String(LA_LIGNE_LENGTH)} ${String(LA_LIGNE_LENGTH)}`}
            animatedProps={reveal}
          />
        </Mask>
      </Defs>
      <Path d={LA_LIGNE_OUTLINE} fill={color} mask={`url(#${maskId})`} />
    </Svg>
  );
}
