import { resolveLocalizedText, type Equipment, type Focus, type Level } from '@oreva/core';
import { spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { usePrograms, useWorkouts } from '@/data/hooks';
import { DEFAULT_WORKOUT_FILTERS, type WorkoutFilters } from '@/data/types';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { AppText, Card, Chip, EmptyState, SampleBadge, Screen, Section, Skeleton } from '@/ui';
import { WorkoutCard } from './WorkoutCard';

const FOCUSES: Focus[] = ['core', 'full_body', 'lower_body', 'upper_body', 'mobility', 'breath'];
const LEVELS: Level[] = ['beginner', 'intermediate'];
const DURATIONS = [5, 10];
const EQUIPMENT: Equipment[] = ['none', 'band', 'small_ball'];

/** Practice (pillar 2): programs and a library of guided sample sessions. */
export function PracticeScreen() {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const [filters, setFilters] = useState<WorkoutFilters>(DEFAULT_WORKOUT_FILTERS);
  const programs = usePrograms();
  const workouts = useWorkouts(filters);

  return (
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        {t('pillars.practice.title')}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {t('pillars.practice.description')}
      </AppText>

      <Section title={t('practice.programs')}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.carousel}
        >
          {programs.isLoading ? <Skeleton width={240} height={160} /> : null}
          {(programs.data ?? []).map((program) => (
            <Pressable
              key={program.id}
              accessibilityRole="button"
              accessibilityLabel={`${resolveLocalizedText(program.title, locale)?.text ?? ''}, ${t('home.programs.weeks', { count: program.weeks })}`}
              onPress={() => router.push(`/programs/${program.id}`)}
              testID={`program-card-${program.id}`}
            >
              <Card tone={program.tone} style={styles.program}>
                {program.isPlaceholder ? <SampleBadge /> : null}
                <AppText variant="headline" numberOfLines={2}>
                  {resolveLocalizedText(program.title, locale)?.text}
                </AppText>
                <AppText variant="footnote" color="textOnPastelSecondary">
                  {t('home.programs.weeks', { count: program.weeks })} ·{' '}
                  {t(`level.${program.level}`)}
                </AppText>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      </Section>

      <Section title={t('practice.library')}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.chips}
        >
          <Chip
            label={t('practice.all')}
            selected={filters.focus === null}
            onPress={() => setFilters({ ...filters, focus: null })}
          />
          {FOCUSES.map((focus) => (
            <Chip
              key={focus}
              label={t(`focus.${focus}`)}
              selected={filters.focus === focus}
              onPress={() =>
                setFilters({ ...filters, focus: filters.focus === focus ? null : focus })
              }
              testID={`focus-${focus}`}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.chips}
        >
          {LEVELS.map((level) => (
            <Chip
              key={level}
              label={t(`level.${level}`)}
              selected={filters.level === level}
              onPress={() =>
                setFilters({ ...filters, level: filters.level === level ? null : level })
              }
            />
          ))}
          {DURATIONS.map((minutes) => (
            <Chip
              key={minutes}
              label={t('practice.maxMinutes', { count: minutes })}
              selected={filters.maxMinutes === minutes}
              onPress={() =>
                setFilters({
                  ...filters,
                  maxMinutes: filters.maxMinutes === minutes ? null : minutes,
                })
              }
            />
          ))}
          {EQUIPMENT.map((item) => (
            <Chip
              key={item}
              label={t(`equipment.${item}`)}
              selected={filters.equipment === item}
              onPress={() =>
                setFilters({ ...filters, equipment: filters.equipment === item ? null : item })
              }
            />
          ))}
        </ScrollView>
        <View style={styles.list}>
          {workouts.isLoading ? <Skeleton height={120} /> : null}
          {(workouts.data ?? []).map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
          {workouts.data && workouts.data.length === 0 ? (
            <EmptyState title={t('practice.empty')} />
          ) : null}
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bleed: {
    marginHorizontal: -(spacing.lg - 4),
  },
  carousel: {
    paddingHorizontal: spacing.lg - 4,
    gap: spacing.sm,
  },
  chips: {
    paddingHorizontal: spacing.lg - 4,
    gap: spacing.xs,
  },
  program: {
    width: 220,
    minHeight: 150,
    gap: spacing.xs,
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
