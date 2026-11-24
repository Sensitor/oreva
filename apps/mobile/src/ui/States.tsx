import { colors, radii, spacing } from '@oreva/tokens';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type DimensionValue } from 'react-native';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { AppText } from './AppText';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.state}>
      <AppText variant="title2" color="textBrand" align="center">
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" color="textSecondary" align="center">
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

export interface ErrorStateProps {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}

export function ErrorState({ message, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.state} accessibilityRole="alert">
      <AppText variant="body" color="danger" align="center">
        {message}
      </AppText>
      <Button label={retryLabel} onPress={onRetry} variant="secondary" />
    </View>
  );
}

export interface SkeletonProps {
  width?: DimensionValue;
  height: number;
  radius?: number;
}

/** Loading placeholder. Pulses gently, and stays still when Reduce Motion is on. */
export function Skeleton({ width = '100%', height, radius = radii.md }: SkeletonProps) {
  const reduceMotion = useReduceMotion();
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return undefined;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [reduceMotion, opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.surfaceMuted, opacity },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
