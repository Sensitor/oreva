import { dayPeriod, resolveLocalizedText, type Focus } from '@oreva/core';
import { spacing } from '@oreva/tokens';
import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useClasses, usePrograms, useWorkouts } from '@/data/hooks';
import { DEFAULT_CLASS_FILTERS, DEFAULT_WORKOUT_FILTERS } from '@/data/types';
import { ClassCard } from '@/features/discover/ClassCard';
import { WorkoutCard, workoutMinutes } from '@/features/practice/WorkoutCard';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText, Card, Chip, IconButton, SampleBadge, Screen, Section, Skeleton } from '@/ui';
import { TodayCard } from './TodayCard';

const CATEGORY_TO_FOCUS = {
  all: null,
  core: 'core',
  fullBody: 'full_body',
  lowerBody: 'lower_body',
  upperBody: 'upper_body',
  mobility: 'mobility',
  breath: 'breath',
} as const satisfies Record<string, Focus | null>;
type CategoryKey = keyof typeof CATEGORY_TO_FOCUS;
const CATEGORY_KEYS = Object.keys(CATEGORY_TO_FOCUS) as CategoryKey[];

/** Riviera cities shown first on Home during the pilot (founders' decision 6). */
const HOME_CITIES = ['monaco', 'nice', 'cannes'];

function deviceTimeZone(): string {
  try {
    return getCalendars()[0]?.timeZone ?? 'UTC';
  } catch {
    return 'UTC';
  }
}

export interface HomeScreenProps {
  /** Injected in tests for a stable greeting. */
  now?: Date;
}

/** Home: one clear next action, then classes, people you follow and sessions. */
export function HomeScreen({ now }: HomeScreenProps) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { state } = usePrototypeStore();
  const [category, setCategory] = useState<CategoryKey>('all');
  const current = useMemo(() => now ?? new Date(), [now]);
  const period = dayPeriod(current, deviceTimeZone());

  const classes = useClasses(DEFAULT_CLASS_FILTERS);
  const programs = usePrograms();
  const workouts = useWorkouts({ ...DEFAULT_WORKOUT_FILTERS, focus: CATEGORY_TO_FOCUS[category] });

  const program = programs.data?.[0];
  const todayWorkoutId = program?.days.find((d) => d.workoutId)?.workoutId;
  const todayWorkout = useWorkouts(DEFAULT_WORKOUT_FILTERS).data?.find(
    (w) => w.id === todayWorkoutId,
  );

  const nearby = (classes.data ?? [])
    .filter((item) => HOME_CITIES.includes(item.city.id))
    .slice(0, 5);
  const fromFollowed = (classes.data ?? [])
    .filter(
      (item) =>
        state.followedInstructors.includes(item.instructor.id) ||
        state.followedOrganizations.includes(item.organization.id),
    )
    .slice(0, 3);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="callout" color="textSecondary">
            {t(`home.greeting.${period}`)}
          </AppText>
          <AppText variant="headline" style={styles.wordmark}>
            {t('app.name')}
          </AppText>
        </View>
        <IconButton
          icon={Bell}
          accessibilityLabel={t('a11y.notifications')}
          onPress={() => router.push('/settings/notifications')}
        />
      </View>

      <AppText variant="display" accessibilityRole="header">
        {t('home.headline')}
      </AppText>

      {program && todayWorkout ? (
        <TodayCard
          session={{
            isPlaceholder: program.isPlaceholder,
            programTitle: program.title,
            day: 1,
            exercises: todayWorkout.exercises.length,
            minutes: workoutMinutes(todayWorkout),
          }}
          onStart={() => router.push(`/workouts/${todayWorkout.id}`)}
        />
      ) : (
        <Skeleton height={236} radius={28} />
      )}

      <Section
        title={t('home2.nearby')}
        actionLabel={t('common.seeAll')}
        onAction={() => router.push('/discover')}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.carousel}
        >
          {classes.isLoading ? <Skeleton width={280} height={200} /> : null}
          {nearby.map((item) => (
            <ClassCard key={item.session.id} item={item} compact />
          ))}
        </ScrollView>
      </Section>

      {fromFollowed.length > 0 ? (
        <Section title={t('home2.following')}>
          {fromFollowed.map((item) => (
            <ClassCard key={item.session.id} item={item} />
          ))}
        </Section>
      ) : null}

      <Section
        title={t('home2.recommended')}
        actionLabel={t('common.seeAll')}
        onAction={() => router.push('/practice')}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.chips}
        >
          {CATEGORY_KEYS.map((key) => (
            <Chip
              key={key}
              label={t(`home.categories.${key}`)}
              selected={category === key}
              onPress={() => setCategory(key)}
            />
          ))}
        </ScrollView>
        <View style={styles.list}>
          {(workouts.data ?? []).slice(0, 3).map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </View>
      </Section>

      <Section
        title={t('home.programs.title')}
        actionLabel={t('common.seeAll')}
        onAction={() => router.push('/practice')}
      >
        <View style={styles.programs}>
          {(programs.data ?? []).slice(0, 2).map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`${resolveLocalizedText(item.title, locale)?.text ?? ''}, ${t('home.programs.weeks', { count: item.weeks })}`}
              onPress={() => router.push(`/programs/${item.id}`)}
              style={styles.programItem}
            >
              <Card tone={item.tone} style={styles.program}>
                {item.isPlaceholder ? <SampleBadge /> : null}
                <AppText variant="headline" numberOfLines={3}>
                  {resolveLocalizedText(item.title, locale)?.text}
                </AppText>
                <AppText variant="footnote" color="textOnPastelSecondary">
                  {t('home.programs.weeks', { count: item.weeks })}
                </AppText>
              </Card>
            </Pressable>
          ))}
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    gap: 2,
  },
  wordmark: {
    letterSpacing: 2,
  },
  bleed: {
    marginHorizontal: -(spacing.lg - 4),
  },
  chips: {
    paddingHorizontal: spacing.lg - 4,
    gap: spacing.xs,
  },
  carousel: {
    paddingHorizontal: spacing.lg - 4,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  programs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  programItem: {
    flex: 1,
  },
  program: {
    flex: 1,
    gap: spacing.xs,
    minHeight: 150,
  },
});
