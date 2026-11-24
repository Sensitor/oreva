import { colors } from '@oreva/tokens';
import { useState } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { pathFromPoints, pathLength, pointAt, wavePoints } from './lineGeometry';

interface CommonProps {
  /** Fixed width. Without it the line fills its container (measured on layout). */
  width?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface UnderlineProps extends CommonProps {
  variant?: 'underline';
}

export interface TabLineProps extends CommonProps {
  variant: 'tab';
}

export interface ProgressLineProps extends CommonProps {
  variant: 'progress';
  /** 0 to 1. */
  value: number;
  /** Optional steps (exercises, days): a dot for each, filled once reached. */
  steps?: number;
  /** Spoken label, e.g. "Program progress". */
  accessibilityLabel: string;
}

export type LineProps = UnderlineProps | TabLineProps | ProgressLineProps;

const SHAPES = {
  underline: { width: 72, height: 10, stroke: 1.5, cycles: 1.25 },
  tab: { width: 22, height: 6, stroke: 2, cycles: 1 },
  progress: { width: 0, height: 18, stroke: 2, cycles: 2.5 },
} as const;

const DOT = 4;

/**
 * La Ligne: the signature wave under editorial titles, under the active tab,
 * and as program progress. Decorative in the first two uses (hidden from
 * screen readers); a labelled progress bar in the third.
 */
export function Line(props: LineProps) {
  const variant = props.variant ?? 'underline';
  const shape = SHAPES[variant];
  const [measured, setMeasured] = useState(0);
  const width = props.width ?? (variant === 'progress' ? measured : shape.width);
  const onLayout =
    props.width === undefined && variant === 'progress'
      ? (event: LayoutChangeEvent) => setMeasured(event.nativeEvent.layout.width)
      : undefined;

  if (props.variant === 'progress') {
    const value = Math.min(Math.max(props.value, 0), 1);
    const inset = DOT + 1;
    const points = wavePoints(width, shape.height, { cycles: shape.cycles }, inset);
    const d = pathFromPoints(points);
    const length = pathLength(points);
    const steps = props.steps && props.steps > 1 ? props.steps : 0;
    const now = Math.round(value * 100);
    return (
      <View
        onLayout={onLayout}
        style={[styles.progress, props.width !== undefined && { width }, props.style]}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={props.accessibilityLabel}
        accessibilityValue={{ min: 0, max: 100, now }}
        testID={props.testID}
      >
        {width > 0 ? (
          <Svg width={width} height={shape.height}>
            <Path
              d={d}
              stroke={colors.borderSubtle}
              strokeWidth={shape.stroke}
              fill="none"
              strokeLinecap="round"
            />
            {value > 0 ? (
              <Path
                d={d}
                stroke={props.color ?? colors.progress}
                strokeWidth={shape.stroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${String(length)} ${String(length)}`}
                strokeDashoffset={length * (1 - value)}
              />
            ) : null}
            {Array.from({ length: steps }, (_, i) => {
              const fraction = i / (steps - 1);
              const point = pointAt(points, fraction);
              if (!point) {
                return null;
              }
              const reached = fraction <= value + 1e-6;
              return (
                <Circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={DOT}
                  fill={reached ? (props.color ?? colors.progress) : colors.surface}
                  stroke={reached ? (props.color ?? colors.progress) : colors.borderControl}
                  strokeWidth={1}
                />
              );
            })}
          </Svg>
        ) : null}
      </View>
    );
  }

  const inset = shape.stroke;
  const points = wavePoints(width, shape.height, { cycles: shape.cycles, phase: 0.4 }, inset);
  return (
    <View
      style={[{ width, height: shape.height }, props.style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={props.testID}
    >
      <Svg width={width} height={shape.height}>
        <Path
          d={pathFromPoints(points)}
          stroke={props.color ?? (variant === 'tab' ? colors.actionPrimary : colors.accent)}
          strokeWidth={shape.stroke}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    height: SHAPES.progress.height,
    alignSelf: 'stretch',
  },
});
