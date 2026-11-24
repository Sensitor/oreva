import { voiles, type VoileTint } from '@oreva/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { pathFromPoints, wavePoints } from './lineGeometry';

export interface VoileProps {
  tint?: VoileTint;
  /** Draw the faint signature line across the upper half, clear of bottom-set text. */
  withLine?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  testID?: string;
}

/** A palette hex with an alpha channel, for the crossing veil. */
function withAlpha(hex: string, alpha: number): string {
  const value = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return `${hex}${value.toString(16).padStart(2, '0')}`;
}

const LINE_BOX = { width: 400, height: 60 };
const LINE_PATH = pathFromPoints(
  wavePoints(LINE_BOX.width, LINE_BOX.height, { cycles: 1.2, phase: 1.1 }, 2),
);

/** The faint signature line of a voile; in layout flow, it fills its box. */
export function VoileLine({
  tint = 'lilac',
  style,
}: {
  tint?: VoileTint;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={style}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${String(LINE_BOX.width)} ${String(LINE_BOX.height)}`}
        preserveAspectRatio="none"
      >
        <Path
          d={LINE_PATH}
          stroke={voiles[tint].line}
          strokeOpacity={0.55}
          strokeWidth={1.25}
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
    </View>
  );
}

/**
 * Voile: two soft gradients crossing, like light through a curtain. The
 * temporary visual for covers until real, documented photography exists. It
 * shows nothing and nobody, so it can never be mistaken for a real class.
 */
export function Voile({ tint = 'lilac', withLine = true, style, children, testID }: VoileProps) {
  const voile = voiles[tint];
  const [first, second, third] = voile.stops;
  return (
    <View style={[styles.base, { backgroundColor: second }, style]} testID={testID}>
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <LinearGradient
          colors={[first, second, third]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[withAlpha(third, 0), withAlpha(third, 0.55), withAlpha(first, 0)]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0.2 }}
          style={StyleSheet.absoluteFill}
        />
        {withLine ? <VoileLine tint={tint} style={styles.line} /> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
    start: 0,
    end: 0,
    top: '6%',
    height: '40%',
  },
});
