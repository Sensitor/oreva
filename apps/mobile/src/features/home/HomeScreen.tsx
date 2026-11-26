import { dayPeriod, resolveLocalizedText, type Focus } from '@oreva/core';
import { formatDayHeading } from '@oreva/i18n';
import { colors, elevation, radii, spacing } from '@oreva/tokens';
import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useClasses, usePrograms, useWorkouts } from '@/data/hooks';
import { DEFAULT_CLASS_FILTERS, DEFAULT_WORKOUT_FILTERS } from '@/data/types';
import { workoutMinutes } from '@/features/practice/WorkoutCard';
import {
  CLASS_CARD_WIDTH,
  ClassRailCard,
  ContinueRow,
  PROGRAM_CARD_WIDTH,
  ProgramCoverCard,
  SESSION_CARD_WIDTH,
  SessionPhotoCard,
  TodaySectionTitle,
} from '@/features/today/TodayParts';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText, Button, Chip, SampleBadge, Skeleton, TAB_BAR_CLEARANCE } from '@/ui';
import { EditorialHero, editorialPhotos, Enter, LaLigne, SpringPressable } from '@/ui/editorial';

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

/** Riviera cities shown first on Today during the pilot (founders' decision 6). */
const HOME_CITIES = ['monaco', 'nice', 'cannes'];

/** The hero takes about half the screen, so today's Start action stays above the fold, even on an iPhone SE. */
const HERO_SHARE = 0.48;
const HERO_MIN = 300;
const HERO_MAX = 480;
/** Below this height (iPhone SE, zoomed display), the intro line gives way to the Start action. */
const COMPACT_HEIGHT = 700;
/** Content starts entering while the photograph settles. */
const ENTER_AFTER = 140;

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

/**
 * Today (editorial direction, 26 Nov 2026). One photograph edge to edge, a
 * cream sheet laid over it with the greeting and La Ligne, today's session and
 * its one action, then rails: classes nearby, sessions for you, programs.
 * Photographs illustrate ORÉVA's own sessions only, never a partner's class.
 */
export function HomeScreen({ now }: HomeScreenProps) {
  const { t } = useTranslation();
  const { locale, formatLocale } = useLocaleSettings();
  const { state } = usePrototypeStore();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
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

  // "Continue": a session left on this phone, with its real progress.
  const resumable = allWorkouts
    ?.map((workout) => ({ workout, elapsed: state.workoutProgress[workout.id] ?? 0 }))
    .find(({ elapsed }) => elapsed > 0);

  const nearby = (classes.data ?? [])
    .filter((item) => HOME_CITIES.includes(item.city.id))
    .slice(0, 6);
  const fromFollowed = (classes.data ?? [])
    .filter(
      (item) =>
        state.followedInstructors.includes(item.instructor.id) ||
        state.followedOrganizations.includes(item.organization.id),
    )
    .slice(0, 4);

  const heroHeight = Math.round(Math.min(Math.max(windowHeight * HERO_SHARE, HERO_MIN), HERO_MAX));
  const compact = windowHeight < COMPACT_HEIGHT;
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE + insets.bottom }}
      >
        <EditorialHero photo={editorialPhotos.today} height={heroHeight} scrollY={scrollY}>
          <View style={[styles.heroBar, { top: insets.top + spacing.xs }]}>
            <SpringPressable
              accessibilityRole="button"
              accessibilityLabel={t('a11y.notifications')}
              onPress={() => router.push('/settings/notifications')}
              style={styles.roundButton}
              pressedScale={0.92}
            >
              <Bell size={20} color={colors.textPrimary} strokeWidth={1.5} />
            </SpringPressable>
          </View>
        </EditorialHero>

        <View style={styles.sheet}>
          <Enter index={0} after={ENTER_AFTER} style={styles.greeting}>
            <AppText variant="kicker" color="textLink">
              {formatDayHeading(current, formatLocale, deviceTimeZone())}
            </AppText>
            <AppText
              variant="display"
              color="textBrand"
              accessibilityRole="header"
              style={compact ? styles.greetingCompact : styles.greetingTitle}
            >
              {t(`home.greeting.${period}`)}
            </AppText>
            <LaLigne width={128} delay={ENTER_AFTER + 260} testID="today-signature" />
            {compact ? null : (
              <AppText variant="body" color="textSecondary" style={styles.intro}>
                {t('home.headline')}
              </AppText>
            )}
          </Enter>

          <Enter index={1} after={ENTER_AFTER}>
            {program && todayWorkout ? (
              <View style={styles.session} testID="today-card">
                <View style={styles.sessionTop}>
                  <AppText variant="kicker" color="textLink" style={styles.flex}>
                    {t('home.today.label')} · {t('home.today.programDay', { day: 1 })}
                  </AppText>
                  {program.isPlaceholder ? <SampleBadge /> : null}
                </View>
                <AppText variant="title1" color="textPrimary">
                  {resolveLocalizedText(program.title, locale)?.text}
                </AppText>
                <AppText variant="callout" color="textSecondary">
                  {t('home.today.exercises', { count: todayWorkout.exercises.length })} ·{' '}
                  {t('common.durationMinutes', { count: workoutMinutes(todayWorkout) })}
                </AppText>
                <Button
                  label={t('home.today.start')}
                  accessibilityLabel={t('a11y.startSession')}
                  shape="pill"
                  withArrow
                  fullWidth
                  onPress={() => router.push(`/workouts/${todayWorkout.id}`)}
                />
              </View>
            ) : (
              <Skeleton height={168} radius={radii.card} />
            )}
          </Enter>

          {resumable ? (
            <Enter index={2} after={ENTER_AFTER} style={styles.block}>
              <TodaySectionTitle title={t('home2.continue')} />
              <ContinueRow
                workout={resumable.workout}
                progress={
                  resumable.elapsed /
                  Math.max(
                    resumable.workout.exercises.reduce((sum, e) => sum + e.durationSec, 0),
                    1,
                  )
                }
                onPress={() => router.push(`/workouts/${resumable.workout.id}`)}
              />
            </Enter>
          ) : null}

          <Enter index={resumable ? 3 : 2} after={ENTER_AFTER} style={styles.block}>
            <TodaySectionTitle
              title={t('home2.nearby')}
              actionLabel={t('common.seeAll')}
              onAction={() => router.push('/discover')}
            />
            <Rail itemWidth={CLASS_CARD_WIDTH}>
              {classes.isLoading ? (
                <Skeleton width={CLASS_CARD_WIDTH} height={220} radius={radii.card} />
              ) : null}
              {nearby.map((item) => (
                <ClassRailCard key={item.session.id} item={item} />
              ))}
            </Rail>
          </Enter>

          {fromFollowed.length > 0 ? (
            <View style={styles.block}>
              <TodaySectionTitle title={t('home2.following')} />
              <Rail itemWidth={CLASS_CARD_WIDTH}>
                {fromFollowed.map((item) => (
                  <ClassRailCard key={item.session.id} item={item} />
                ))}
              </Rail>
            </View>
          ) : null}

          <View style={styles.block}>
            <TodaySectionTitle
              title={t('home2.recommended')}
              actionLabel={t('common.seeAll')}
              onAction={() => router.push('/practice')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.bleed}
              contentContainerStyle={styles.chips}
            >
              {CATEGORY_KEYS.map((key) => (
                <Chip
                  key={key}
                  shape="pill"
                  label={t(`home.categories.${key}`)}
                  selected={category === key}
                  onPress={() => setCategory(key)}
                />
              ))}
            </ScrollView>
            <Rail itemWidth={SESSION_CARD_WIDTH}>
              {(workouts.data ?? []).map((workout) => (
                <SessionPhotoCard
                  key={workout.id}
                  workout={workout}
                  inProgress={(state.workoutProgress[workout.id] ?? 0) > 0}
                  onPress={() => router.push(`/workouts/${workout.id}`)}
                />
              ))}
            </Rail>
          </View>

          <View style={styles.block}>
            <TodaySectionTitle
              title={t('home.programs.title')}
              actionLabel={t('common.seeAll')}
              onAction={() => router.push('/practice')}
            />
            <Rail itemWidth={PROGRAM_CARD_WIDTH}>
              {(programs.data ?? []).map((item) => (
                <ProgramCoverCard
                  key={item.id}
                  program={item}
                  onPress={() => router.push(`/programs/${item.id}`)}
                />
              ))}
            </Rail>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/** A horizontal rail that rests on a card edge, with the next card peeking in. */
function Rail({ itemWidth, children }: { itemWidth: number; children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bleed}
      contentContainerStyle={styles.rail}
      snapToInterval={itemWidth + spacing.md}
      decelerationRate="fast"
      snapToAlignment="start"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroBar: {
    position: 'absolute',
    end: spacing.gutter,
    flexDirection: 'row',
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: elevation.raised,
  },
  // The cream sheet laid over the photograph.
  sheet: {
    marginTop: -radii.sheet,
    borderTopStartRadius: radii.sheet,
    borderTopEndRadius: radii.sheet,
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.gutter,
    gap: spacing.xxl,
  },
  greeting: {
    gap: spacing.xs,
  },
  greetingTitle: {
    fontSize: 46,
    lineHeight: 52,
  },
  greetingCompact: {
    fontSize: 40,
    lineHeight: 46,
  },
  intro: {
    marginTop: spacing.xxs,
  },
  session: {
    gap: spacing.xs,
    marginTop: -spacing.md,
  },
  sessionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  block: {
    gap: spacing.md,
  },
  bleed: {
    marginHorizontal: -spacing.gutter,
  },
  chips: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.xs,
  },
  rail: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.md,
  },
});
