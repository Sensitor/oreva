import type { Workout } from '@oreva/core';
import { colors, motion, radii, spacing } from '@oreva/tokens';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { AppText, Button } from '@/ui';
import { EditorialImage, Enter, LaLigne, photoFor } from '@/ui/editorial';
import { workoutMinutes } from './WorkoutCard';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const ease = Easing.bezier(...motion.easing.out);

/** The ring around the session's photograph. */
const RING = 188;
const STROKE = 2;
const RADIUS = (RING - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** The ring closes in a little under a second; the words come in as it does. */
const CLOSE_MS = 950;
const TEXT_AFTER = 260;

/**
 * The end of a session: the session's photograph in a circle, a fine iris
 * ring closing around it, then "Session complete", Bravo in serif with La
 * Ligne under it, and the real numbers of the session (never calories, P-15).
 * With Reduce Motion everything is simply there.
 */
export function SessionComplete({ workout, onDone }: { workout: Workout; onDone: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const closed = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    closed.value = reduceMotion
      ? 1
      : withDelay(120, withTiming(1, { duration: CLOSE_MS, easing: ease }));
  }, [closed, reduceMotion]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - closed.value),
  }));
  const photoStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, closed.value * 2.5),
    transform: [{ scale: 0.94 + 0.06 * Math.min(1, closed.value * 1.6) }],
  }));

  const facts = [
    { label: t('player.exercisesLabel'), value: String(workout.exercises.length) },
    { label: t('player.minutesLabel'), value: String(workoutMinutes(workout)) },
  ];

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.md },
      ]}
    >
      <View style={styles.centre}>
        <View
          style={styles.ring}
          testID="player-completion-mark"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Animated.View style={[styles.photoWrap, photoStyle]}>
            <EditorialImage photo={photoFor(workout.id)} style={styles.photo} />
          </Animated.View>
          <Svg width={RING} height={RING} style={StyleSheet.absoluteFill}>
            <G rotation={-90} origin={`${String(RING / 2)}, ${String(RING / 2)}`}>
              <Circle
                cx={RING / 2}
                cy={RING / 2}
                r={RADIUS}
                stroke={colors.borderSubtle}
                strokeWidth={STROKE}
                fill="none"
              />
              <AnimatedCircle
                cx={RING / 2}
                cy={RING / 2}
                r={RADIUS}
                stroke={colors.progress}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${String(CIRCUMFERENCE)} ${String(CIRCUMFERENCE)}`}
                animatedProps={ringProps}
                fill="none"
              />
            </G>
          </Svg>
        </View>

        <Enter index={0} after={TEXT_AFTER} style={styles.words}>
          <AppText variant="kicker" color="textLink" align="center">
            {t('player.finished')}
          </AppText>
          <AppText
            variant="display"
            color="textBrand"
            align="center"
            accessibilityRole="header"
            style={styles.bravo}
          >
            {t('player.bravo')}
          </AppText>
          <LaLigne width={112} delay={TEXT_AFTER + 380} testID="player-signature" />
          <AppText variant="body" color="textSecondary" align="center" style={styles.body}>
            {t('player.finishedBody')}
          </AppText>
        </Enter>

        <Enter index={1} after={TEXT_AFTER} style={styles.summary}>
          <View style={styles.summaryRow} testID="player-summary">
            {facts.map((fact, index) => (
              <View
                key={fact.label}
                style={[styles.fact, index > 0 && styles.factDivided]}
                accessible
                accessibilityLabel={`${fact.label}, ${fact.value}`}
              >
                <AppText variant="numeral" color="textBrand" align="center">
                  {fact.value}
                </AppText>
                <AppText variant="caption" color="textSecondary" align="center">
                  {fact.label}
                </AppText>
              </View>
            ))}
          </View>
        </Enter>
      </View>

      <Enter index={2} after={TEXT_AFTER}>
        <Button
          label={t('common.done')}
          shape="pill"
          withArrow
          fullWidth
          onPress={onDone}
          testID="player-done"
        />
      </Enter>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.gutter,
    justifyContent: 'space-between',
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  ring: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoWrap: {
    width: RING - 28,
    height: RING - 28,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  words: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  bravo: {
    fontSize: 56,
    lineHeight: 64,
  },
  body: {
    maxWidth: 300,
    marginTop: spacing.xxs,
  },
  summary: {
    alignSelf: 'stretch',
  },
  summaryRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderControl,
    paddingVertical: spacing.sm,
  },
  fact: {
    flex: 1,
    alignItems: 'center',
  },
  factDivided: {
    borderStartWidth: StyleSheet.hairlineWidth,
    borderStartColor: colors.borderSubtle,
  },
});
