import type { Equipment, Focus, Level } from '@oreva/core';
import { colors, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePrograms, useWorkouts } from '@/data/hooks';
import { DEFAULT_WORKOUT_FILTERS, type WorkoutFilters } from '@/data/types';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { AppText, Chip, EmptyState, Skeleton, TAB_BAR_CLEARANCE } from '@/ui';
import { EditorialTabs, Enter, rise } from '@/ui/editorial';
import { ProgramCover } from './ProgramCover';
import { programProgress } from './programProgress';
import { WorkoutCard } from './WorkoutCard';

const FOCUSES: Focus[] = ['core', 'full_body', 'lower_body', 'upper_body', 'mobility', 'breath'];
const LEVELS: Level[] = ['beginner', 'intermediate'];
const DURATIONS = [5, 10];
const EQUIPMENT: Equipment[] = ['none', 'band', 'small_ball'];

type PracticeView = 'programs' | 'sessions';

const hasFilters = (filters: WorkoutFilters) =>
  Object.entries(filters).some(
    ([key, value]) => value !== DEFAULT_WORKOUT_FILTERS[key as keyof WorkoutFilters],
  );

/**
 * Practice (editorial direction): a serif title, two views on a sliding rule.
 * Programs are magazine chapters (a photograph and a paper caption with their
 * real progress); sessions are a photographed library with filters.
 */
export function PracticeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const { state } = usePrototypeStore();
  const [view, setView] = useState<PracticeView>('programs');
  const [filters, setFilters] = useState<WorkoutFilters>(DEFAULT_WORKOUT_FILTERS);
  const programs = usePrograms();
  const workouts = useWorkouts(filters);
  const completed = state.completedWorkouts.map((c) => c.workoutId);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: TAB_BAR_CLEARANCE + insets.bottom,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Enter index={0} style={styles.header}>
        <AppText
          variant="display"
          color="textBrand"
          accessibilityRole="header"
          style={styles.title}
        >
          {t('pillars.practice.title')}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {t('pillars.practice.description')}
        </AppText>
      </Enter>

      <Enter index={1}>
        <EditorialTabs
          tabs={[
            { key: 'programs', label: t('practice.programs') },
            { key: 'sessions', label: t('practice.sessions') },
          ]}
          selected={view}
          onSelect={setView}
          testID="practice-view"
        />
      </Enter>

      {/* The view fades in and rises when it changes; at once with Reduce Motion. */}
      <Animated.View key={view} entering={reduceMotion ? undefined : rise(0)}>
        {view === 'programs' ? (
          <View style={styles.programs}>
            {programs.isLoading ? <Skeleton height={420} /> : null}
            {(programs.data ?? []).map((program, index) => (
              <Enter key={program.id} index={index + 2}>
                <ProgramCover
                  index={index}
                  program={program}
                  progress={programProgress(program, completed)}
                  onPress={() => router.push(`/programs/${program.id}`)}
                  testID={`program-card-${program.id}`}
                />
              </Enter>
            ))}
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
                shape="pill"
                label={t('practice.all')}
                selected={filters.focus === null}
                onPress={() => setFilters({ ...filters, focus: null })}
              />
              {FOCUSES.map((focus) => (
                <Chip
                  key={focus}
                  shape="pill"
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
                  shape="pill"
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
                  shape="pill"
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
                  shape="pill"
                  label={t(`equipment.${item}`)}
                  selected={filters.equipment === item}
                  onPress={() =>
                    setFilters({ ...filters, equipment: filters.equipment === item ? null : item })
                  }
                />
              ))}
            </ScrollView>
            <View style={styles.list}>
              {workouts.isLoading ? <Skeleton height={110} /> : null}
              {(workouts.data ?? []).map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
              {workouts.data && workouts.data.length === 0 ? (
                <View style={styles.empty}>
                  <EmptyState title={t('practice.empty')} />
                  {hasFilters(filters) ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setFilters(DEFAULT_WORKOUT_FILTERS)}
                      hitSlop={12}
                      style={styles.reset}
                      testID="practice-reset-filters"
                    >
                      <AppText variant="callout" weight="semibold" color="textLink">
                        {t('practice.resetFilters')}
                      </AppText>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 46,
    lineHeight: 52,
  },
  programs: {
    gap: spacing.xxl,
    paddingTop: spacing.xs,
  },
  library: {
    gap: spacing.sm,
  },
  bleed: {
    marginHorizontal: -spacing.gutter,
  },
  chips: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.xs,
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  reset: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
