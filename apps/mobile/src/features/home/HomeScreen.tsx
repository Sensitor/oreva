import { dayPeriod, resolveLocalizedText, type Focus } from '@oreva/core';
import { formatDayHeading } from '@oreva/i18n';
import { colors, radii, spacing } from '@oreva/tokens';
import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useClasses, usePrograms, useWorkouts } from '@/data/hooks';
import { DEFAULT_CLASS_FILTERS, DEFAULT_WORKOUT_FILTERS } from '@/data/types';
import { ClassCard } from '@/features/discover/ClassCard';
import { WorkoutCard, workoutMinutes } from '@/features/practice/WorkoutCard';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import {
  AppText,
  Chip,
  EditorialCover,
  EditorialHeader,
  IconButton,
  Line,
  PressableScale,
  SampleBadge,
  Screen,
  Section,
  Skeleton,
} from '@/ui';
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

/** Today (the Home tab): one clear next action, then classes, people you follow and sessions. */
export function HomeScreen({ now }: HomeScreenProps) {
  const { t } = useTranslation();
  const { locale, formatLocale } = useLocaleSettings();
  const { state } = usePrototypeStore();
  const [category, setCategory] = useState<CategoryKey>('all');
  const current = useMemo(() => now ?? new Date(), [now]);
  const period = dayPeriod(current, deviceTimeZone());

  const classes = useClasses(DEFAULT_CLASS_FILTERS);
  const programs = usePrograms();
  const workouts = useWorkouts({ ...DEFAULT_WORKOUT_FILTERS, focus: CATEGORY_TO_FOCUS[category] });

  const allWorkouts = useWorkouts(DEFAULT_WORKOUT_FILTERS).data;
  const program = programs.data?.[0];
  const todayWorkoutId = program?.days.find((d) => d.workoutId)?.workoutId;
  const todayWorkout = allWorkouts?.find((w) => w.id === todayWorkoutId);

  // "Continue": a session the member left on this phone, with its real progress.
  const resumable = allWorkouts
    ?.map((workout) => ({ workout, elapsed: state.workoutProgress[workout.id] ?? 0 }))
    .find(({ elapsed }) => elapsed > 0);

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
      <EditorialHeader
        kicker={formatDayHeading(current, formatLocale, deviceTimeZone())}
        title={t(`home.greeting.${period}`)}
        intro={t('home.headline')}
        action={
          <IconButton
            icon={Bell}
            accessibilityLabel={t('a11y.notifications')}
            onPress={() => router.push('/settings/notifications')}
          />
        }
      />

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
        <Skeleton height={260} radius={radii.lg} />
      )}

      {resumable ? (
        <Section title={t('home2.continue')}>
          <ContinueRow
            title={resolveLocalizedText(resumable.workout.title, locale)?.text ?? ''}
            minutes={workoutMinutes(resumable.workout)}
            progress={
              resumable.elapsed /
              Math.max(
                resumable.workout.exercises.reduce((sum, e) => sum + e.durationSec, 0),
                1,
              )
            }
            onPress={() => router.push(`/workouts/${resumable.workout.id}`)}
          />
        </Section>
      ) : null}

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.carousel}
        >
          {(programs.data ?? []).map((item) => {
            const title = resolveLocalizedText(item.title, locale)?.text ?? '';
            const weeks = t('home.programs.weeks', { count: item.weeks });
            return (
              <View key={item.id} style={styles.program}>
                <EditorialCover
                  tint={item.tone}
                  kicker={weeks}
                  title={title}
                  badge={item.isPlaceholder ? <SampleBadge /> : undefined}
                  accessibilityLabel={`${title}, ${weeks}`}
                  onPress={() => router.push(`/programs/${item.id}`)}
                  minHeight={200}
                />
              </View>
            );
          })}
        </ScrollView>
      </Section>
    </Screen>
  );
}

/** A session left halfway, with La Ligne showing how far the member got. */
function ContinueRow({
  title,
  minutes,
  progress,
  onPress,
}: {
  title: string;
  minutes: number;
  progress: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={[
        title,
        t('common.durationMinutes', { count: minutes }),
        t('practice.resume'),
      ].join(', ')}
      onPress={onPress}
      style={styles.continue}
      testID="home-continue"
    >
      <View style={styles.continueText}>
        <AppText variant="headline" numberOfLines={1} style={styles.flex}>
          {title}
        </AppText>
        <AppText variant="callout" weight="semibold" color="textLink">
          {t('practice.resume')}
        </AppText>
      </View>
      <Line variant="progress" value={progress} accessibilityLabel={t('player.sessionProgress')} />
    </PressableScale>
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
  carousel: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  list: {
    marginTop: spacing.xs,
  },
  program: {
    width: 260,
  },
  continue: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  continueText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
