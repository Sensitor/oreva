import { resolveLocalizedText, type Equipment, type Focus, type Level } from '@oreva/core';
import { spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { usePrograms, useWorkouts } from '@/data/hooks';
import { DEFAULT_WORKOUT_FILTERS, type WorkoutFilters } from '@/data/types';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import {
  Chip,
  EditorialCover,
  EditorialHeader,
  EmptyState,
  SampleBadge,
  Screen,
  Skeleton,
  UnderlineTabs,
} from '@/ui';
import { WorkoutCard } from './WorkoutCard';

const FOCUSES: Focus[] = ['core', 'full_body', 'lower_body', 'upper_body', 'mobility', 'breath'];
const LEVELS: Level[] = ['beginner', 'intermediate'];
const DURATIONS = [5, 10];
const EQUIPMENT: Equipment[] = ['none', 'band', 'small_ball'];

type PracticeView = 'programs' | 'sessions';

/** Practice (pillar 2): programs and a library of guided sample sessions. */
export function PracticeScreen() {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const [view, setView] = useState<PracticeView>('programs');
  const [filters, setFilters] = useState<WorkoutFilters>(DEFAULT_WORKOUT_FILTERS);
  const programs = usePrograms();
  const workouts = useWorkouts(filters);

  return (
    <Screen>
      <EditorialHeader
        title={t('pillars.practice.title')}
        intro={t('pillars.practice.description')}
      />
      <UnderlineTabs
        tabs={[
          { key: 'programs', label: t('practice.programs') },
          { key: 'sessions', label: t('practice.sessions') },
        ]}
        selected={view}
        onSelect={setView}
        testID="practice-view"
      />

      {view === 'programs' ? (
        <View style={styles.programs}>
          {programs.isLoading ? <Skeleton height={220} /> : null}
          {(programs.data ?? []).map((program) => {
            const title = resolveLocalizedText(program.title, locale)?.text ?? '';
            const weeks = t('home.programs.weeks', { count: program.weeks });
            return (
              <EditorialCover
                key={program.id}
                tint={program.tone}
                kicker={`${weeks} · ${t(`level.${program.level}`)}`}
                title={title}
                badge={program.isPlaceholder ? <SampleBadge /> : undefined}
                accessibilityLabel={`${title}, ${weeks}`}
                onPress={() => router.push(`/programs/${program.id}`)}
                minHeight={200}
                testID={`program-card-${program.id}`}
              />
            );
          })}
        </View>
      ) : (
        <View style={styles.library}>
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
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bleed: {
    marginHorizontal: -spacing.gutter,
  },
  chips: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.xs,
  },
  programs: {
    gap: spacing.md,
  },
  library: {
    gap: spacing.sm,
  },
  list: {
    marginTop: spacing.xs,
  },
});
