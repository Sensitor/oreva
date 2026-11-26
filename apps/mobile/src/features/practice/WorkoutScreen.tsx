import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useInstructorProfile, useWorkout } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { languagesLabel } from '@/lib/format';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText, Button, EmptyState, SampleBadge, Screen, ScreenHeader, Skeleton } from '@/ui';
import { DetailLayout, Enter, FactStrip, photoFor } from '@/ui/editorial';
import { formatTimer } from './session';
import { workoutMinutes } from './WorkoutCard';

/** Content enters while the photograph settles. */
const ENTER_AFTER = 120;

/**
 * A session, before starting it (editorial direction): its photograph, the
 * title in serif, three facts on a strip (never calories, P-15), the
 * exercises numbered in serif, and Start kept within reach at the bottom.
 */
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
        <Skeleton height={320} radius={radii.cover} />
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
  const credits = [
    instructor.data ? t('practice.with', { name: instructor.data.instructor.displayName }) : null,
    t('practice.audio', { language: languagesLabel([workout.audioLanguage], t) }),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <DetailLayout
      photo={photoFor(workout.id)}
      heroTestID="workout-cover"
      action={
        <Button
          label={resumeAt > 0 ? t('practice.resume') : t('practice.start')}
          shape="pill"
          withArrow
          fullWidth
          onPress={() => router.push(`/player/${workout.id}`)}
          testID="start-workout"
        />
      }
    >
      <Enter index={0} after={ENTER_AFTER} style={styles.heading}>
        <View style={styles.kickerRow}>
          <AppText variant="kicker" color="textLink" style={styles.flex}>
            {t(`focus.${workout.focus}`)}
          </AppText>
          {workout.isPlaceholder ? <SampleBadge /> : null}
        </View>
        <AppText variant="display" color="textBrand" accessibilityRole="header">
          {title}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {resolveLocalizedText(workout.description, locale)?.text}
        </AppText>
      </Enter>

      <Enter index={1} after={ENTER_AFTER} style={styles.facts}>
        <FactStrip
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
          {credits}
        </AppText>
      </Enter>

      <Enter index={2} after={ENTER_AFTER} style={styles.exercises}>
        <AppText variant="title2" color="textBrand" accessibilityRole="header">
          {t('practice.exercises', { count: workout.exercises.length })}
        </AppText>
        <View>
          {workout.exercises.map((exercise, index) => {
            const name = resolveLocalizedText(exercise.name, locale)?.text ?? '';
            return (
              <View
                key={exercise.id}
                style={[styles.exercise, index > 0 && styles.exerciseDivided]}
                accessible
                accessibilityLabel={`${String(index + 1)}. ${name}, ${formatTimer(exercise.durationSec)}`}
              >
                <AppText variant="numeralSmall" color="textLink" style={styles.number}>
                  {String(index + 1).padStart(2, '0')}
                </AppText>
                <AppText variant="bodyStrong" style={styles.flex}>
                  {name}
                </AppText>
                <AppText variant="callout" color="textSecondary" style={styles.time}>
                  {formatTimer(exercise.durationSec)}
                </AppText>
              </View>
            );
          })}
        </View>
      </Enter>
    </DetailLayout>
  );
}

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
  facts: {
    gap: spacing.sm,
  },
  exercises: {
    gap: spacing.sm,
  },
  exercise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 60,
    paddingVertical: spacing.xs,
  },
  exerciseDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  number: {
    minWidth: 40,
  },
  time: {
    fontVariant: ['tabular-nums'],
  },
});
