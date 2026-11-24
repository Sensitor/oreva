import { colors } from '@oreva/tokens';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from './AppText';

export interface ProgressRingProps {
  /** 0 to 1. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

/** From this size the label uses the serif numerals. */
const LARGE_RING = 96;

/**
 * A fine iris ring on a hairline track. Shows session progress, never calories.
 * Iris, not lavender: lavender is 2.66:1 on cream, below the 3:1 for graphics.
 */
export function ProgressRing({ progress, size = 64, strokeWidth = 4, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const percent = Math.round(clamped * 100);
  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.borderSubtle}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.progress}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${String(circumference)} ${String(circumference)}`}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${String(size / 2)} ${String(size / 2)})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <AppText
          variant={size >= LARGE_RING ? 'numeralSmall' : 'callout'}
          weight={size >= LARGE_RING ? undefined : 'semibold'}
          color="textBrand"
        >
          {label ?? `${String(percent)}%`}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
