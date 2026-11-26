import { resolveLocalizedText, type ProgramDay, type Workout } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useProgram, useWorkouts } from '@/data/hooks';
import { DEFAULT_WORKOUT_FILTERS } from '@/data/types';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import {
  AppText,
  BreathIcon,
  Button,
  CompleteIcon,
  EmptyState,
  SampleBadge,
  Screen,
  ScreenHeader,
  Skeleton,
} from '@/ui';
import {
  DetailLayout,
  EditorialImage,
  Enter,
  photoFor,
  ProgressThread,
  SpringPressable,
} from '@/ui/editorial';
import { programProgress } from './programProgress';
import { workoutMinutes } from './WorkoutCard';

/** Content enters while the photograph settles. */
const ENTER_AFTER = 120;

export function ProgramScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { state } = usePrototypeStore();
  const program = useProgram(id);
  const workouts = useWorkouts(DEFAULT_WORKOUT_FILTERS);

  if (program.isLoading) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <Skeleton height={320} radius={radii.cover} />
      </Screen>
    );
  }
  if (!program.data) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <EmptyState title={t('errors.generic')} />
      </Screen>
    );
  }

  const data = program.data;
  const title = resolveLocalizedText(data.title, locale)?.text ?? '';
  // Progress comes only from sessions finished on this phone: never invented.
  const completed = state.completedWorkouts.map((c) => c.workoutId);
  const progress = programProgress(data, completed);
  const first = progress.sessionDays[0];
  const target = progress.nextDay ?? first;
  const actionLabel =
    progress.doneDays === 0
      ? t('practice.startProgram')
      : progress.nextDay
        ? t('practice.continueDay', { day: progress.nextDay.day })
        : t('practice.startAgain');

  return (
    <DetailLayout
      photo={photoFor(data.id)}
      heroTestID="program-cover"
      action={
        target?.workoutId ? (
          <Button
            label={actionLabel}
            shape="pill"
            withArrow
            fullWidth
            onPress={() => router.push(`/workouts/${target.workoutId}`)}
            testID="program-start"
          />
        ) : null
      }
    >
      <Enter index={0} after={ENTER_AFTER} style={styles.heading}>
        <View style={styles.kickerRow}>
          <AppText variant="kicker" color="textLink" style={styles.flex}>
            {t('home.programs.weeks', { count: data.weeks })} · {t(`level.${data.level}`)}
          </AppText>
          {data.isPlaceholder ? <SampleBadge /> : null}
        </View>
        <AppText variant="display" color="textBrand" accessibilityRole="header">
          {title}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {resolveLocalizedText(data.description, locale)?.text}
        </AppText>
      </Enter>

      {progress.sessionDays.length > 0 ? (
        <Enter index={1} after={ENTER_AFTER} style={styles.progress}>
          <AppText variant="kicker" color="textSecondary">
            {t('practice.programProgress')}
          </AppText>
          <AppText variant="title2" color="textPrimary">
            {t('practice.sessionsDone', {
              done: progress.doneDays,
              count: progress.sessionDays.length,
            })}
          </AppText>
          <ProgressThread value={progress.value} label={t('practice.programProgress')} />
        </Enter>
      ) : null}

      <Enter index={2} after={ENTER_AFTER} style={styles.schedule}>
        <AppText variant="title2" color="textBrand" accessibilityRole="header">
          {t('practice.schedule')}
        </AppText>
        <View>
          {data.days.map((day, index) => (
            <DayRow
              key={day.day}
              day={day}
              workout={workouts.data?.find((w) => w.id === day.workoutId)}
              completed={progress.doneDayNumbers.has(day.day)}
              next={day.day === progress.nextDay?.day && progress.doneDays > 0}
              first={index === 0}
              last={index === data.days.length - 1}
            />
          ))}
        </View>
      </Enter>
    </DetailLayout>
  );
}

/**
 * One day of the program on a path: a mark on a fine vertical thread (filled
 * once the session is finished on this phone, a ring for the next one), the
 * session's photograph, its title and length. Rest days are quieter.
 */
function DayRow({
  day,
  workout,
  completed,
  next,
  first,
  last,
}: {
  day: ProgramDay;
  workout: Workout | undefined;
  completed: boolean;
  next: boolean;
  first: boolean;
  last: boolean;
}) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const dayLabel = t('practice.day', { day: day.day });

  if (!workout) {
    return (
      <View
        style={[styles.row, styles.restRow]}
        accessible
        accessibilityLabel={`${dayLabel}, ${t('practice.restDay')}`}
      >
        <Path mark="rest" first={first} last={last} />
        <View style={styles.restIcon}>
          <BreathIcon size={18} color={colors.textSecondary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="kicker" color="textSecondary">
            {dayLabel}
          </AppText>
          <AppText variant="callout" color="textSecondary">
            {t('practice.restDay')}
          </AppText>
        </View>
      </View>
    );
  }

  const workoutTitle = resolveLocalizedText(workout.title, locale)?.text ?? '';
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityLabel={[
        dayLabel,
        workoutTitle,
        completed ? t('player.completed') : null,
        next ? t('practice.upNext') : null,
      ]
        .filter(Boolean)
        .join(', ')}
      onPress={() => router.push(`/workouts/${workout.id}`)}
      style={styles.row}
      pressedScale={0.98}
      testID={`program-day-${day.day}`}
    >
      <Path mark={completed ? 'done' : next ? 'next' : 'todo'} first={first} last={last} />
      <EditorialImage photo={photoFor(workout.id)} style={styles.thumb} />
      <View style={styles.flex}>
        <AppText variant="kicker" color="textLink">
          {next ? `${dayLabel} · ${t('practice.upNext')}` : dayLabel}
        </AppText>
        <AppText variant="headline" numberOfLines={2}>
          {workoutTitle}
        </AppText>
        <AppText variant="footnote" color="textSecondary">
          {t('common.durationMinutes', { count: workoutMinutes(workout) })}
        </AppText>
      </View>
      {completed ? (
        <CompleteIcon size={22} color={colors.progress} />
      ) : (
        <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
      )}
    </SpringPressable>
  );
}

/** The program path: a fine thread and the day's mark on it. Decorative. */
function Path({
  mark,
  first,
  last,
}: {
  mark: 'done' | 'next' | 'todo' | 'rest';
  first: boolean;
  last: boolean;
}) {
  return (
    <View style={styles.path} accessibilityElementsHidden importantForAccessibility="no">
      <View style={[styles.thread, first && styles.threadFirst, last && styles.threadLast]} />
      <View
        style={[
          styles.mark,
          mark === 'done' && styles.markDone,
          mark === 'next' && styles.markNext,
          mark === 'rest' && styles.markRest,
        ]}
      />
    </View>
  );
}

const MARK = 10;

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xs,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  progress: {
    gap: spacing.xxs,
  },
  schedule: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 92,
    paddingVertical: spacing.xs,
  },
  restRow: {
    minHeight: 64,
  },
  path: {
    width: MARK,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thread: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.borderSubtle,
  },
  threadFirst: {
    top: '50%',
  },
  threadLast: {
    bottom: '50%',
  },
  mark: {
    width: MARK,
    height: MARK,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.borderControl,
    backgroundColor: colors.background,
  },
  markDone: {
    borderColor: colors.progress,
    backgroundColor: colors.progress,
  },
  markNext: {
    borderColor: colors.progress,
    borderWidth: 2,
  },
  markRest: {
    width: 6,
    height: 6,
    borderWidth: 0,
    backgroundColor: colors.borderControl,
  },
  thumb: {
    width: 60,
    aspectRatio: 4 / 5,
    borderRadius: radii.lg + 6,
  },
  restIcon: {
    width: 60,
    alignItems: 'center',
  },
});
