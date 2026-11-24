import { resolveLocalizedText } from '@oreva/core';
import { colors, spacing } from '@oreva/tokens';
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
  EditorialCover,
  EmptyState,
  Line,
  PressableScale,
  SampleBadge,
  Screen,
  ScreenHeader,
  Section,
  Skeleton,
} from '@/ui';
import { workoutMinutes } from './WorkoutCard';

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
        <Skeleton height={200} />
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
  const firstWorkout = data.days.find((d) => d.workoutId)?.workoutId;
  const title = resolveLocalizedText(data.title, locale)?.text ?? '';
  // Progress comes only from sessions finished on this phone: never invented.
  const done = new Set(state.completedWorkouts.map((c) => c.workoutId));
  const sessionDays = data.days.filter((d) => d.workoutId);
  const doneDays = sessionDays.filter((d) => d.workoutId && done.has(d.workoutId)).length;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader />
      <EditorialCover
        tint={data.tone}
        kicker={`${t('home.programs.weeks', { count: data.weeks })} · ${t(`level.${data.level}`)}`}
        title={title}
        badge={data.isPlaceholder ? <SampleBadge /> : undefined}
        minHeight={240}
        testID="program-cover"
      />
      <AppText variant="body">{resolveLocalizedText(data.description, locale)?.text}</AppText>
      {sessionDays.length > 1 ? (
        <Line
          variant="progress"
          value={doneDays / sessionDays.length}
          steps={sessionDays.length}
          accessibilityLabel={t('practice.programProgress')}
          testID="program-progress"
        />
      ) : null}
      {firstWorkout ? (
        <Button
          label={t('practice.startProgram')}
          withArrow
          onPress={() => router.push(`/workouts/${firstWorkout}`)}
        />
      ) : null}
      <Section title={t('practice.schedule')}>
        <View style={styles.list}>
          {data.days.map((day) => {
            const workout = workouts.data?.find((w) => w.id === day.workoutId);
            if (!workout) {
              return (
                <View
                  key={day.day}
                  style={styles.row}
                  accessible
                  accessibilityLabel={`${t('practice.day', { day: day.day })}, ${t('practice.restDay')}`}
                >
                  <AppText variant="numeralSmall" color="textSecondary" style={styles.number}>
                    {String(day.day)}
                  </AppText>
                  <View style={styles.flex}>
                    <AppText variant="bodyStrong" color="textSecondary">
                      {t('practice.restDay')}
                    </AppText>
                  </View>
                  <BreathIcon size={20} color={colors.textSecondary} />
                </View>
              );
            }
            const workoutTitle = resolveLocalizedText(workout.title, locale)?.text ?? '';
            const completed = done.has(workout.id);
            return (
              <PressableScale
                key={day.day}
                accessibilityRole="button"
                accessibilityLabel={[
                  t('practice.day', { day: day.day }),
                  workoutTitle,
                  completed ? t('player.completed') : null,
                ]
                  .filter(Boolean)
                  .join(', ')}
                onPress={() => router.push(`/workouts/${workout.id}`)}
                style={styles.row}
                testID={`program-day-${day.day}`}
              >
                <AppText variant="numeralSmall" color="textBrand" style={styles.number}>
                  {String(day.day)}
                </AppText>
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">{workoutTitle}</AppText>
                  <AppText variant="footnote" color="textSecondary">
                    {t('common.durationMinutes', { count: workoutMinutes(workout) })}
                  </AppText>
                </View>
                {completed ? (
                  <CompleteIcon size={22} color={colors.success} />
                ) : (
                  <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
                )}
              </PressableScale>
            );
          })}
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  number: {
    minWidth: 36,
  },
  flex: {
    flex: 1,
  },
});
