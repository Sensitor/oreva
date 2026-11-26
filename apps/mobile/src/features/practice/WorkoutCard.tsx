import { resolveLocalizedText, type Workout } from '@oreva/core';
import { radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText, Badge, SampleBadge } from '@/ui';
import { EditorialImage, photoFor, SpringPressable } from '@/ui/editorial';

export function workoutMinutes(workout: Workout): number {
  return Math.round(workout.exercises.reduce((sum, e) => sum + e.durationSec, 0) / 60);
}

/** A session in the library: its 4:5 photograph, then focus, title, length and level. */
export function WorkoutCard({ workout }: { workout: Workout }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { state } = usePrototypeStore();
  const title = resolveLocalizedText(workout.title, locale)?.text ?? '';
  const minutes = workoutMinutes(workout);
  const inProgress = (state.workoutProgress[workout.id] ?? 0) > 0;
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityLabel={[
        title,
        t('common.durationMinutes', { count: minutes }),
        t(`level.${workout.level}`),
        inProgress ? t('practice.resume') : null,
      ]
        .filter(Boolean)
        .join(', ')}
      onPress={() => router.push(`/workouts/${workout.id}`)}
      testID={`workout-card-${workout.id}`}
      style={styles.row}
      pressedScale={0.98}
    >
      <EditorialImage photo={photoFor(workout.id)} style={styles.photo} />
      <View style={styles.text}>
        <AppText variant="kicker" color="textLink" numberOfLines={1}>
          {t(`focus.${workout.focus}`)}
        </AppText>
        <AppText variant="headline" numberOfLines={2}>
          {title}
        </AppText>
        <AppText variant="footnote" color="textSecondary">
          {t('common.durationMinutes', { count: minutes })} · {t(`level.${workout.level}`)} ·{' '}
          {t('practice.exercises', { count: workout.exercises.length })}
        </AppText>
        {workout.premium || inProgress || workout.isPlaceholder ? (
          <View style={styles.badges}>
            {workout.premium ? <Badge label={t('practice.premium')} tone="surfaceMuted" /> : null}
            {inProgress ? <Badge label={t('practice.resume')} tone="backgroundTint" /> : null}
            {workout.isPlaceholder ? <SampleBadge /> : null}
          </View>
        ) : null}
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  photo: {
    width: 88,
    aspectRatio: 4 / 5,
    borderRadius: radii.lg + 8,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
});
