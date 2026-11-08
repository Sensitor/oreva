import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { Clock, Gauge, Package } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useInstructorProfile, useWorkout } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { languagesLabel } from '@/lib/format';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
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
  const tiles = [
    {
      icon: Gauge,
      value: t(`level.${workout.level}`),
      label: t('classDetail.level'),
      tone: 'tileMint' as const,
    },
    {
      icon: Clock,
      value: t('common.durationMinutes', { count: workoutMinutes(workout) }),
      label: t('classDetail.duration'),
      tone: 'tileViolet' as const,
    },
    {
      icon: Package,
      value: workout.equipment.map((e) => t(`equipment.${e}`)).join(', '),
      label: t('practice.equipment'),
      tone: 'tileOrchid' as const,
    },
  ];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader />
      <View style={styles.titleBlock}>
        <View style={styles.badges}>{workout.isPlaceholder ? <SampleBadge /> : null}</View>
        <AppText variant="title1" accessibilityRole="header">
          {resolveLocalizedText(workout.title, locale)?.text}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {resolveLocalizedText(workout.description, locale)?.text}
        </AppText>
      </View>
      <View style={styles.tiles}>
        {tiles.map(({ icon: Icon, value, label, tone }) => (
          <Card
            key={label}
            tone={tone}
            style={styles.tile}
            accessible
            accessibilityLabel={`${label}: ${value}`}
          >
            <View style={styles.tileIcon}>
              <Icon size={18} color={colors.textPrimary} strokeWidth={1.75} />
            </View>
            <AppText variant="bodyStrong" numberOfLines={2}>
              {value}
            </AppText>
            <AppText variant="caption" color="textOnPastelSecondary">
              {label}
            </AppText>
          </Card>
        ))}
      </View>
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
        <Card padded={false}>
          {workout.exercises.map((exercise, index) => (
            <View
              key={exercise.id}
              style={styles.exercise}
              accessible
              accessibilityLabel={`${String(index + 1)}. ${resolveLocalizedText(exercise.name, locale)?.text ?? ''}, ${formatTimer(exercise.durationSec)}`}
            >
              <View style={[styles.number, { backgroundColor: colors[workout.tone] }]}>
                <AppText variant="callout" weight="bold">
                  {String(index + 1)}
                </AppText>
              </View>
              <AppText variant="bodyStrong" style={styles.flex}>
                {resolveLocalizedText(exercise.name, locale)?.text}
              </AppText>
              <AppText variant="callout" color="textSecondary">
                {formatTimer(exercise.durationSec)}
              </AppText>
            </View>
          ))}
        </Card>
      </Section>

      <PillButton
        label={resumeAt > 0 ? t('practice.resume') : t('practice.start')}
        fullWidth
        onPress={() => router.push(`/player/${workout.id}`)}
        testID="start-workout"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    gap: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tile: {
    flex: 1,
    gap: spacing.xxs,
    padding: spacing.sm,
    minHeight: 120,
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  exercise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  number: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
});
