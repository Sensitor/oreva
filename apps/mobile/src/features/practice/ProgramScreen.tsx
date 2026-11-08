import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight, Moon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useProgram, useWorkouts } from '@/data/hooks';
import { DEFAULT_WORKOUT_FILTERS } from '@/data/types';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import {
  AppText,
  Card,
  EmptyState,
  PillButton,
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

  return (
    <Screen withTabBar={false}>
      <ScreenHeader />
      <Card tone={data.tone} style={styles.hero}>
        {data.isPlaceholder ? <SampleBadge /> : null}
        <AppText variant="title1" accessibilityRole="header">
          {resolveLocalizedText(data.title, locale)?.text}
        </AppText>
        <AppText variant="callout" color="textOnPastelSecondary">
          {t('home.programs.weeks', { count: data.weeks })} · {t(`level.${data.level}`)}
        </AppText>
      </Card>
      <AppText variant="body">{resolveLocalizedText(data.description, locale)?.text}</AppText>
      {firstWorkout ? (
        <PillButton
          label={t('practice.startProgram')}
          withArrow
          onPress={() => router.push(`/workouts/${firstWorkout}`)}
        />
      ) : null}
      <Section title={t('practice.schedule')}>
        <Card padded={false}>
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
                  <View style={styles.dayBadge}>
                    <Moon size={18} color={colors.textSecondary} strokeWidth={1.75} />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="footnote" color="textSecondary">
                      {t('practice.day', { day: day.day })}
                    </AppText>
                    <AppText variant="bodyStrong">{t('practice.restDay')}</AppText>
                  </View>
                </View>
              );
            }
            const title = resolveLocalizedText(workout.title, locale)?.text ?? '';
            return (
              <Pressable
                key={day.day}
                accessibilityRole="button"
                accessibilityLabel={`${t('practice.day', { day: day.day })}, ${title}`}
                onPress={() => router.push(`/workouts/${workout.id}`)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                testID={`program-day-${day.day}`}
              >
                <View style={[styles.dayBadge, { backgroundColor: colors[workout.tone] }]}>
                  <AppText variant="callout" weight="bold">
                    {String(day.day)}
                  </AppText>
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">{title}</AppText>
                  <AppText variant="footnote" color="textSecondary">
                    {t('common.durationMinutes', { count: workoutMinutes(workout) })}
                  </AppText>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
              </Pressable>
            );
          })}
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  dayBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
