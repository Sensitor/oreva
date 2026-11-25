import { resolveLocalizedText } from '@oreva/core';
import { colors, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useInstructorProfile, useWorkout } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { languagesLabel } from '@/lib/format';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import {
  AppText,
  Button,
  EditorialCover,
  EmptyState,
  FactList,
  SampleBadge,
  Screen,
  ScreenHeader,
  Section,
  Skeleton,
} from '@/ui';
import { formatTimer } from './session';
import { workoutMinutes } from './WorkoutCard';

/** Session overview, after the reference's "Pilates Primer" screen (no calorie tile, P-15). */
export function WorkoutScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { state } = usePrototypeStore();
  const { data: workout, isLoading } = useWorkout(id);
  const instructor = useInstructorProfile(workout?.instructorId ?? '');

  if (isLoading) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <Skeleton height={200} />
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

  const resumeAt = state.workoutProgress[workout.id] ?? 0;
  const title = resolveLocalizedText(workout.title, locale)?.text ?? '';

  return (
    <Screen withTabBar={false}>
      <ScreenHeader />
      <EditorialCover
        tone="paper"
        kicker={t(`focus.${workout.focus}`)}
        title={title}
        badge={workout.isPlaceholder ? <SampleBadge /> : undefined}
        testID="workout-cover"
      />
      <AppText variant="body" color="textSecondary">
        {resolveLocalizedText(workout.description, locale)?.text}
      </AppText>

      {/* Facts on a hairline row instead of coloured tiles. Never calories (P-15). */}
      <FactList
        facts={[
          { label: t('classDetail.level'), value: t(`level.${workout.level}`) },
          {
            label: t('classDetail.duration'),
            value: t('common.durationMinutes', { count: workoutMinutes(workout) }),
          },
          {
            label: t('practice.equipment'),
            value: workout.equipment.map((e) => t(`equipment.${e}`)).join(', '),
          },
        ]}
        testID="workout-facts"
      />
      <AppText variant="footnote" color="textSecondary">
        {[
          instructor.data
            ? t('practice.with', { name: instructor.data.instructor.displayName })
            : null,
          t('practice.audio', { language: languagesLabel([workout.audioLanguage], t) }),
        ]
          .filter(Boolean)
          .join(' · ')}
      </AppText>

      <Section title={t('practice.exercises', { count: workout.exercises.length })}>
        <View style={styles.list}>
          {workout.exercises.map((exercise, index) => (
            <View
              key={exercise.id}
              style={styles.exercise}
              accessible
              accessibilityLabel={`${String(index + 1)}. ${resolveLocalizedText(exercise.name, locale)?.text ?? ''}, ${formatTimer(exercise.durationSec)}`}
            >
              <AppText variant="numeralSmall" color="textLink" style={styles.number}>
                {String(index + 1).padStart(2, '0')}
              </AppText>
              <AppText variant="bodyStrong" style={styles.flex}>
                {resolveLocalizedText(exercise.name, locale)?.text}
              </AppText>
              <AppText variant="callout" color="textSecondary" style={styles.time}>
                {formatTimer(exercise.durationSec)}
              </AppText>
            </View>
          ))}
        </View>
      </Section>

      <Button
        label={resumeAt > 0 ? t('practice.resume') : t('practice.start')}
        fullWidth
        withArrow
        onPress={() => router.push(`/player/${workout.id}`)}
        testID="start-workout"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  exercise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 60,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  number: {
    minWidth: 40,
  },
  flex: {
    flex: 1,
  },
  time: {
    fontVariant: ['tabular-nums'],
  },
});
