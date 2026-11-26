import { resolveLocalizedText, type Workout } from '@oreva/core';
import { colors, elevation, motion, radii, spacing } from '@oreva/tokens';
import { useVideoPlayer, VideoView } from 'expo-video';
import { router } from 'expo-router';
import { SkipBack, SkipForward, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkout } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { haptics } from '@/theme/haptics';
import { useReduceMotion } from '@/theme/useReduceMotion';
import {
  AppText,
  Badge,
  EmptyState,
  PauseIcon,
  PlayIcon,
  Screen,
  ScreenHeader,
  Skeleton,
  type IconComponent,
} from '@/ui';
import { rise, RoundButton, SpringPressable } from '@/ui/editorial';
import { formatTimer, sessionPosition, startOfExercise, type SessionPosition } from './session';
import { SessionComplete } from './SessionComplete';
import { sampleVideos } from './videos';

/**
 * The guided player (editorial direction): the video edge to edge, and a
 * paper sheet with the exercise in serif, its timer, a progress line made of
 * one segment per exercise, and three controls. The controls never hide, so
 * the timer stays readable and reachable (VoiceOver, Switch Control).
 * Progress is saved on this phone so the session can be resumed.
 */
export function PlayerScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const { data: workout, isLoading } = useWorkout(id);
  if (isLoading) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <Skeleton height={320} />
      </Screen>
    );
  }
  if (!workout) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <EmptyState title={t('errors.generic')} />
      </Screen>
    );
  }
  return <Player workout={workout} />;
}

function Player({ workout }: { workout: Workout }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const { state, update } = usePrototypeStore();
  const [elapsed, setElapsed] = useState(() => state.workoutProgress[workout.id] ?? 0);
  const [playing, setPlaying] = useState(false);
  const elapsedRef = useRef(elapsed);
  const recordedRef = useRef(false);

  const player = useVideoPlayer(
    sampleVideos[workout.videoKey] ?? sampleVideos.breath ?? null,
    (p) => {
      p.loop = true;
      p.muted = true;
    },
  );

  const position = sessionPosition(workout.exercises, elapsed);
  const finished = position.finished;
  const current = workout.exercises[position.index];
  const next = workout.exercises[position.index + 1];

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    if (!playing || finished) {
      player.pause();
      return undefined;
    }
    player.play();
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [playing, finished, player]);

  // Record the completed session once, on this phone (shown in Profile).
  useEffect(() => {
    if (!finished || recordedRef.current) {
      return;
    }
    recordedRef.current = true;
    // The one success haptic of the app: a session completed.
    haptics.success();
    update((s) => ({
      ...s,
      workoutProgress: { ...s.workoutProgress, [workout.id]: 0 },
      completedWorkouts: [
        ...s.completedWorkouts,
        { workoutId: workout.id, completedAt: new Date().toISOString() },
      ],
    }));
  }, [finished, update, workout.id]);

  // Save the position when leaving, so the session can be resumed.
  useEffect(
    () => () => {
      if (recordedRef.current) {
        return;
      }
      const value = elapsedRef.current;
      update((s) => ({ ...s, workoutProgress: { ...s.workoutProgress, [workout.id]: value } }));
    },
    [update, workout.id],
  );

  const jumpTo = (index: number) => {
    const bounded = Math.min(Math.max(index, 0), workout.exercises.length - 1);
    setElapsed(startOfExercise(workout.exercises, bounded));
  };

  if (finished) {
    return <SessionComplete workout={workout} onDone={() => router.back()} />;
  }

  const exerciseName = resolveLocalizedText(current?.name ?? workout.title, locale)?.text ?? '';

  return (
    <View style={styles.screen}>
      <VideoView
        player={player}
        // Sized to the window, not stretched: the web renders a stretched video at its own size.
        style={[styles.video, { width, height }]}
        nativeControls={false}
        contentFit="cover"
        accessible={false}
      />

      <View style={[styles.topBar, { top: insets.top + spacing.xs }]}>
        <RoundButton
          icon={X}
          accessibilityLabel={t('player.close')}
          onPress={() => router.back()}
          testID="player-close"
        />
        <Badge label={t('practice.sampleVideo')} />
      </View>

      <Animated.View
        entering={reduceMotion ? undefined : rise(80)}
        style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <SegmentedProgress
          durations={workout.exercises.map((e) => e.durationSec)}
          position={position}
          playing={playing}
          label={t('player.sessionProgress')}
        />

        <View style={styles.now}>
          <View style={styles.flex}>
            <AppText variant="kicker" color="textLink">
              {t('player.exerciseOf', {
                current: position.index + 1,
                total: workout.exercises.length,
              })}
            </AppText>
            {/* The exercise name changes with a short fade and rise. */}
            <Animated.View key={position.index} entering={reduceMotion ? undefined : rise(0)}>
              <AppText variant="title1" color="textPrimary" numberOfLines={2}>
                {exerciseName}
              </AppText>
            </Animated.View>
          </View>
          <AppText
            variant="numeral"
            color="textBrand"
            accessibilityRole="timer"
            accessibilityLiveRegion="none"
            testID="player-timer"
            style={styles.timer}
          >
            {formatTimer(position.exerciseRemaining)}
          </AppText>
        </View>

        <View style={styles.up}>
          {next ? (
            <AppText variant="footnote" color="textSecondary" numberOfLines={1}>
              {t('player.up', { name: resolveLocalizedText(next.name, locale)?.text ?? '' })}
            </AppText>
          ) : null}
        </View>

        <View style={styles.controls}>
          <ControlButton
            icon={SkipBack}
            label={t('player.previous')}
            onPress={() => jumpTo(position.index - 1)}
            testID="player-previous"
          />
          <ControlButton
            icon={playing ? PauseIcon : PlayIcon}
            label={playing ? t('player.pause') : t('player.play')}
            onPress={() => setPlaying((value) => !value)}
            primary
            testID="player-toggle"
          />
          <ControlButton
            icon={SkipForward}
            label={t('player.next')}
            onPress={() => jumpTo(position.index + 1)}
            testID="player-next"
          />
        </View>

        <AppText variant="caption" color="textSecondary" align="center">
          {t('player.captions')}
        </AppText>
      </Animated.View>
    </View>
  );
}

function ControlButton({
  icon: Icon,
  label,
  onPress,
  primary,
  testID,
}: {
  icon: IconComponent;
  label: string;
  onPress: () => void;
  primary?: boolean;
  testID?: string;
}) {
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      haptic={primary ? 'light' : undefined}
      pressedScale={0.9}
      testID={testID}
      style={[styles.control, primary && styles.controlPrimary]}
    >
      <Icon
        size={primary ? 30 : 24}
        color={primary ? colors.textOnAction : colors.textPrimary}
        strokeWidth={1.5}
      />
    </SpringPressable>
  );
}

const linear = Easing.linear;
const ease = Easing.bezier(...motion.easing.out);

/**
 * The session as a line of segments, one per exercise, sized by its length.
 * Finished exercises are full, the current one fills second by second (a
 * continuous glide while playing), the next ones are empty.
 */
function SegmentedProgress({
  durations,
  position,
  playing,
  label,
}: {
  durations: number[];
  position: SessionPosition;
  playing: boolean;
  label: string;
}) {
  return (
    <View
      style={styles.segments}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(position.progress * 100) }}
      testID="player-progress"
    >
      {durations.map((duration, index) => (
        <Segment
          key={index}
          duration={duration}
          value={
            index < position.index
              ? 1
              : index > position.index
                ? 0
                : position.exerciseElapsed / Math.max(duration, 1)
          }
          gliding={playing && index === position.index}
        />
      ))}
    </View>
  );
}

function Segment({
  duration,
  value,
  gliding,
}: {
  duration: number;
  value: number;
  gliding: boolean;
}) {
  const reduceMotion = useReduceMotion();
  const fill = useSharedValue(value);

  useEffect(() => {
    if (reduceMotion) {
      fill.value = value;
      return;
    }
    // While playing, glide towards where the next second will be, so the line
    // moves continuously; otherwise settle quickly on the value.
    const target = gliding ? Math.min(value + 1 / Math.max(duration, 1), 1) : value;
    fill.value = withTiming(
      target,
      gliding ? { duration: 1000, easing: linear } : { duration: 240, easing: ease },
    );
  }, [value, gliding, duration, reduceMotion, fill]);

  const style = useAnimatedStyle(() => ({ width: `${String(fill.value * 100)}%` as `${number}%` }));
  return (
    <View style={[styles.segment, { flex: duration }]}>
      <Animated.View style={[styles.segmentFill, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  video: {
    position: 'absolute',
    top: 0,
    start: 0,
  },
  topBar: {
    position: 'absolute',
    start: spacing.gutter,
    end: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // The paper sheet over the video.
  sheet: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.gutter,
    gap: spacing.md,
    borderTopStartRadius: radii.sheet,
    borderTopEndRadius: radii.sheet,
    backgroundColor: colors.surface,
    boxShadow: elevation.raised,
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  segment: {
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  segmentFill: {
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.progress,
  },
  now: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: spacing.xxs,
  },
  timer: {
    fontSize: 52,
    lineHeight: 60,
  },
  // Keeps its height on the last exercise, so the controls do not move.
  up: {
    minHeight: 18,
    marginTop: -spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xs,
  },
  control: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderControl,
  },
  controlPrimary: {
    width: 76,
    height: 76,
    borderWidth: 0,
    backgroundColor: colors.actionPrimary,
  },
});
