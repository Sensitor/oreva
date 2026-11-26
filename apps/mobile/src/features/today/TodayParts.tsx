import { resolveLocalizedText, type Program, type Workout } from '@oreva/core';
import { colors, elevation, motion, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { ClassListItem } from '@/data/types';
import { workoutMinutes } from '@/features/practice/WorkoutCard';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { classWhen, priceLabel } from '@/lib/format';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { AppText, Badge, NearIcon, SampleBadge } from '@/ui';
import { EditorialImage, photoFor, SpringPressable } from '@/ui/editorial';

const ease = Easing.bezier(...motion.easing.out);

/** Width of the cards in each rail, so the next card always peeks in. */
export const CLASS_CARD_WIDTH = 248;
export const SESSION_CARD_WIDTH = 168;
export const PROGRAM_CARD_WIDTH = 272;

/** A section title on Today: the serif title and, at the end, "See all". */
export function TodaySectionTitle({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionTitle}>
      <AppText variant="title2" color="textBrand" accessibilityRole="header" style={styles.flex}>
        {title}
      </AppText>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="link"
          onPress={onAction}
          hitSlop={12}
          style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
        >
          <AppText variant="callout" weight="semibold" color="textLink">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/** A class, in the rail: when first (serif time), then what, who and where. No photograph: studios use their own. */
export function ClassRailCard({ item }: { item: ClassListItem }) {
  const { t } = useTranslation();
  const { locale, formatLocale } = useLocaleSettings();
  const { session, organization, instructor, venue, city } = item;
  const title = resolveLocalizedText(session.title, locale, session.sourceLanguage)?.text ?? '';
  const place = resolveLocalizedText(venue.name, locale)?.text ?? '';
  const when = classWhen(session, city, formatLocale);
  const full = session.spotsLeft <= 0;
  const spots = full
    ? t('classDetail.full')
    : t('home.upcoming.spotsLeft', { count: session.spotsLeft });
  const price = priceLabel(session, t, formatLocale);
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityLabel={[
        title,
        organization.name,
        `${when.date} ${when.time}`,
        place,
        price,
        spots,
      ]
        .filter(Boolean)
        .join(', ')}
      onPress={() => router.push(`/classes/${session.id}`)}
      style={styles.classCard}
      testID={`today-class-${session.id}`}
    >
      <View style={styles.cardTop}>
        <AppText variant="kicker" color="textLink" numberOfLines={1} style={styles.flex}>
          {when.date}
        </AppText>
        {session.isPlaceholder ? <SampleBadge /> : null}
      </View>
      <AppText variant="numeral" color="textBrand" style={styles.time}>
        {when.time}
      </AppText>
      <AppText variant="headline" numberOfLines={2}>
        {title}
      </AppText>
      <AppText variant="footnote" color="textSecondary" numberOfLines={1}>
        {organization.name} · {instructor.displayName}
      </AppText>
      <View style={styles.place}>
        <NearIcon size={14} color={colors.textSecondary} />
        <AppText variant="footnote" color="textSecondary" numberOfLines={1} style={styles.flex}>
          {place}
        </AppText>
      </View>
      <View style={styles.cardFoot}>
        <AppText variant="footnote" weight="semibold">
          {price}
        </AppText>
        <AppText variant="footnote" weight="semibold" color={full ? 'danger' : 'textLink'}>
          {spots}
        </AppText>
      </View>
    </SpringPressable>
  );
}

/** A guided session: a 4:5 photograph, then its title and length. */
export function SessionPhotoCard({
  workout,
  inProgress,
  onPress,
}: {
  workout: Workout;
  inProgress: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const title = resolveLocalizedText(workout.title, locale)?.text ?? '';
  const minutes = workoutMinutes(workout);
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
      onPress={onPress}
      style={styles.sessionCard}
      testID={`workout-card-${workout.id}`}
    >
      <EditorialImage photo={photoFor(workout.id)} style={styles.sessionImage} />
      <View style={styles.cardText}>
        <AppText variant="headline" numberOfLines={2}>
          {title}
        </AppText>
        <AppText variant="footnote" color="textSecondary">
          {t('common.durationMinutes', { count: minutes })} · {t(`level.${workout.level}`)}
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

/** A program: a large 4:5 cover, then its length, level and title. */
export function ProgramCoverCard({ program, onPress }: { program: Program; onPress: () => void }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const title = resolveLocalizedText(program.title, locale)?.text ?? '';
  const weeks = t('home.programs.weeks', { count: program.weeks });
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${weeks}`}
      onPress={onPress}
      style={styles.programCard}
      testID={`today-program-${program.id}`}
    >
      <EditorialImage photo={photoFor(program.id)} style={styles.programImage} />
      <View style={styles.cardText}>
        <AppText variant="kicker" color="textLink">
          {weeks} · {t(`level.${program.level}`)}
        </AppText>
        <AppText variant="title2" color="textPrimary">
          {title}
        </AppText>
        {program.isPlaceholder ? <SampleBadge /> : null}
      </View>
    </SpringPressable>
  );
}

/**
 * A fine progress thread: it grows to the real value in 600 ms when it
 * appears; with Reduce Motion it is drawn at its value.
 */
export function ProgressThread({ value, label }: { value: number; label: string }) {
  const reduceMotion = useReduceMotion();
  const clamped = Math.min(Math.max(value, 0), 1);
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(reduceMotion ? clamped : 0);

  useEffect(() => {
    progress.value = reduceMotion
      ? clamped
      : withDelay(200, withTiming(clamped, { duration: motion.duration.progress, easing: ease }));
  }, [clamped, reduceMotion, progress]);

  const fill = useAnimatedStyle(() => ({ width: width * progress.value }));
  return (
    <View
      style={styles.thread}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View style={[styles.threadFill, fill]} />
    </View>
  );
}

/** A session left halfway on this phone: its photograph, its title, how far you got. */
export function ContinueRow({
  workout,
  progress,
  onPress,
}: {
  workout: Workout;
  progress: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const title = resolveLocalizedText(workout.title, locale)?.text ?? '';
  const minutes = workoutMinutes(workout);
  return (
    <SpringPressable
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
      <EditorialImage photo={photoFor(workout.id)} style={styles.continueImage} />
      <View style={styles.continueText}>
        <AppText variant="headline" numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="footnote" weight="semibold" color="textLink">
          {t('practice.resume')}
        </AppText>
        <ProgressThread value={progress} label={t('player.sessionProgress')} />
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
  },
  linkPressed: {
    opacity: 0.6,
  },
  classCard: {
    width: CLASS_CARD_WIDTH,
    padding: spacing.gutter - 2,
    gap: 2,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    boxShadow: elevation.soft,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  time: {
    fontSize: 40,
    lineHeight: 46,
    marginBottom: spacing.xxs,
  },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  cardFoot: {
    gap: 2,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  sessionCard: {
    width: SESSION_CARD_WIDTH,
    gap: spacing.sm,
  },
  sessionImage: {
    width: SESSION_CARD_WIDTH,
    aspectRatio: 4 / 5,
    borderRadius: radii.card,
  },
  programCard: {
    width: PROGRAM_CARD_WIDTH,
    gap: spacing.sm,
  },
  programImage: {
    width: PROGRAM_CARD_WIDTH,
    aspectRatio: 4 / 5,
    borderRadius: radii.cover,
  },
  cardText: {
    gap: 2,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
  thread: {
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.borderSubtle,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  threadFill: {
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.progress,
  },
  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  continueImage: {
    width: 64,
    height: 64,
    borderRadius: radii.md + 10,
  },
  continueText: {
    flex: 1,
    gap: 2,
  },
});
