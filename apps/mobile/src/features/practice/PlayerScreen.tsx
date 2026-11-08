import { resolveLocalizedText } from '@oreva/core';
import { colors, elevation, radii, spacing, touchTarget } from '@oreva/tokens';
import { useVideoPlayer, VideoView } from 'expo-video';
import { router } from 'expo-router';
import { Pause, Play, SkipBack, SkipForward, type LucideIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useWorkout } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import {
  AppText,
  Badge,
  EmptyState,
  PillButton,
  ProgressRing,
  Screen,
  ScreenHeader,
  Skeleton,
} from '@/ui';
import { formatTimer, sessionPosition, startOfExercise } from './session';
import { sampleVideos } from './videos';

function ControlButton({
  icon: Icon,
  label,
  onPress,
  primary,
  testID,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  primary?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.control,
        primary && styles.controlPrimary,
        pressed && styles.pressed,
      ]}
    >
      <Icon size={26} color={colors.textPrimary} strokeWidth={2} />
    </Pressable>
  );
}

/**
 * Guided player, after the reference's player screen: video, "Completed" card
 * with progress ring, exercise timer and three large controls. Progress is
 * saved on this phone so the session can be resumed.
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

function Player({ workout }: { workout: NonNullable<ReturnType<typeof useWorkout>['data']> }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
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
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <View style={styles.finished}>
          <ProgressRing progress={1} size={120} strokeWidth={8} />
          <AppText variant="title1" align="center" accessibilityRole="header">
            {t('player.finished')}
          </AppText>
          <AppText variant="body" color="textSecondary" align="center">
            {t('player.finishedBody')}
          </AppText>
          <PillButton label={t('common.done')} onPress={() => router.back()} testID="player-done" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen withTabBar={false} scroll={false}>
      <ScreenHeader title={resolveLocalizedText(current?.name ?? workout.title, locale)?.text} />
      <View style={styles.video}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          nativeControls={false}
          contentFit="cover"
        />
        <View style={styles.videoBadge}>
          <Badge label={t('practice.sampleVideo')} />
        </View>
      </View>
      <View style={styles.status}>
        <View style={styles.flex}>
          <AppText variant="headline">{t('player.completed')}</AppText>
          <AppText variant="footnote" color="textSecondary">
            {t('player.exerciseOf', {
              current: position.index + 1,
              total: workout.exercises.length,
            })}
          </AppText>
          {next ? (
            <AppText variant="footnote" color="textSecondary" numberOfLines={1}>
              {t('player.up', { name: resolveLocalizedText(next.name, locale)?.text ?? '' })}
            </AppText>
          ) : null}
        </View>
        <ProgressRing progress={position.progress} />
      </View>
      <AppText
        variant="display"
        align="center"
        accessibilityRole="timer"
        accessibilityLiveRegion="none"
        testID="player-timer"
      >
        {formatTimer(position.exerciseRemaining)}
      </AppText>
      <View style={styles.controls}>
        <ControlButton
          icon={SkipBack}
          label={t('player.previous')}
          onPress={() => jumpTo(position.index - 1)}
          testID="player-previous"
        />
        <ControlButton
          icon={playing ? Pause : Play}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  video: {
    flex: 1,
    minHeight: 220,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundTint,
  },
  videoBadge: {
    position: 'absolute',
    top: spacing.sm,
    start: spacing.sm,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    boxShadow: elevation.soft,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  control: {
    flex: 1,
    minHeight: touchTarget.comfortable + 16,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: elevation.soft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  controlPrimary: {
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
  finished: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
});
