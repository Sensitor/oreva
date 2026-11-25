import { resolveLocalizedText, type Workout } from '@oreva/core';
import { colors, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText, Badge, PressableScale, SampleBadge } from '@/ui';

export function workoutMinutes(workout: Workout): number {
  return Math.round(workout.exercises.reduce((sum, e) => sum + e.durationSec, 0) / 60);
}

/** A session in the library, as a line of the programme: the minutes in serif, then title and level. */
export function WorkoutCard({ workout }: { workout: Workout }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { state } = usePrototypeStore();
  const title = resolveLocalizedText(workout.title, locale)?.text ?? '';
  const minutes = workoutMinutes(workout);
  const inProgress = (state.workoutProgress[workout.id] ?? 0) > 0;
  return (
    <PressableScale
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
    >
      <View
        style={styles.stub}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <AppText variant="numeralSmall" color="textBrand">
          {String(minutes)}
        </AppText>
        <AppText variant="caption" weight="semibold" color="textSecondary">
          {t('common.minutesShort')}
        </AppText>
      </View>
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
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  stub: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderEndWidth: 1,
    borderEndColor: colors.borderControl,
    paddingEnd: spacing.sm,
  },
  text: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
});
