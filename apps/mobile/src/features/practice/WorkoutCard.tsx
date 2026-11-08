import { resolveLocalizedText, type Workout } from '@oreva/core';
import { colors, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText, Badge, Card, SampleBadge } from '@/ui';

export function workoutMinutes(workout: Workout): number {
  return Math.round(workout.exercises.reduce((sum, e) => sum + e.durationSec, 0) / 60);
}

export function WorkoutCard({ workout }: { workout: Workout }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { state } = usePrototypeStore();
  const title = resolveLocalizedText(workout.title, locale)?.text ?? '';
  const minutes = workoutMinutes(workout);
  const inProgress = (state.workoutProgress[workout.id] ?? 0) > 0;
  return (
    <Pressable
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
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card tone={workout.tone} style={styles.card}>
        <View style={styles.badges}>
          <Badge label={t(`focus.${workout.focus}`)} />
          {workout.premium ? <Badge label={t('practice.premium')} /> : null}
          {inProgress ? <Badge label={t('practice.resume')} tone="backgroundTint" /> : null}
          {workout.isPlaceholder ? <SampleBadge /> : null}
        </View>
        <AppText variant="headline">{title}</AppText>
        <View style={styles.meta}>
          <Clock size={16} color={colors.textOnPastelSecondary} strokeWidth={1.75} />
          <AppText variant="footnote" color="textOnPastelSecondary">
            {t('common.durationMinutes', { count: minutes })} · {t(`level.${workout.level}`)} ·{' '}
            {t('practice.exercises', { count: workout.exercises.length })}
          </AppText>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs + 2,
  },
  pressed: {
    opacity: 0.9,
  },
});
