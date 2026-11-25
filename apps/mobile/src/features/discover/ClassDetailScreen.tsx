import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight, Gauge, Languages, Lock, Tag, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useClassDetail } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { classWhen, languagesLabel, priceLabel } from '@/lib/format';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  EmptyState,
  FictionalBanner,
  InfoRow,
  NearIcon,
  PressableScale,
  SampleBadge,
  Screen,
  ScreenHeader,
  Skeleton,
} from '@/ui';

/**
 * Class detail. Booking is not part of Phase 2 (roadmap revision 4, Phase 7):
 * the button is shown disabled with an explanation, never a fake booking.
 */
export function ClassDetailScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const { locale, formatLocale } = useLocaleSettings();
  const { data: item, isLoading } = useClassDetail(id);

  if (isLoading) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <Skeleton height={200} />
      </Screen>
    );
  }
  if (!item) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <EmptyState title={t('errors.generic')} />
      </Screen>
    );
  }

  const { session, organization, instructor, venue, city } = item;
  const title = resolveLocalizedText(session.title, locale, session.sourceLanguage);
  const when = classWhen(session, city, formatLocale);
  const isPrivate = venue.visibility === 'after_booking';
  const cityName = resolveLocalizedText(city.name, locale)?.text ?? '';

  const spots =
    session.spotsLeft > 0
      ? t('home.upcoming.spotsLeft', { count: session.spotsLeft })
      : t('classDetail.full');

  return (
    <Screen withTabBar={false}>
      <ScreenHeader />

      {/* The ticket, full size: what, when (in the class's own time zone), how long. */}
      <View style={styles.ticket} testID="class-ticket">
        <View style={styles.ticketTop}>
          <View style={styles.tags}>
            <Badge label={t(`specialty.${session.specialty}`)} tone="surfaceMuted" />
            {session.isPlaceholder ? <SampleBadge /> : null}
          </View>
          <AppText variant="title1" color="textBrand" accessibilityRole="header">
            {title?.text}
          </AppText>
          <AppText variant="callout" color="textSecondary">
            {organization.name} · {instructor.displayName}
          </AppText>
        </View>
        <View style={styles.perforation} />
        <View
          style={styles.ticketBottom}
          accessible
          accessibilityLabel={[
            t('classDetail.when'),
            `${when.date} ${when.time}`,
            t('classDetail.localTime', { city: cityName }),
            t('classDetail.minutes', { count: session.durationMin }),
          ].join(', ')}
        >
          <View style={styles.flex}>
            <AppText variant="kicker" color="textLink">
              {when.date}
            </AppText>
            <AppText variant="numeral" color="textBrand">
              {when.time}
            </AppText>
            <AppText variant="footnote" color="textSecondary">
              {t('classDetail.localTime', { city: cityName })}
            </AppText>
          </View>
          <View style={styles.duration}>
            <AppText variant="kicker" color="textSecondary">
              {t('classDetail.duration')}
            </AppText>
            <AppText variant="bodyStrong" color="textBrand">
              {t('classDetail.minutes', { count: session.durationMin })}
            </AppText>
          </View>
        </View>
      </View>
      {session.isPlaceholder ? <FictionalBanner /> : null}

      <View style={styles.list}>
        <InfoRow
          icon={isPrivate ? Lock : NearIcon}
          label={t('classDetail.where')}
          value={resolveLocalizedText(venue.name, locale)?.text ?? ''}
          detail={isPrivate ? t('discover.privateArea') : (venue.addressLine ?? undefined)}
        />
        <InfoRow icon={Gauge} label={t('classDetail.level')} value={t(`level.${session.level}`)} />
        <InfoRow
          icon={Languages}
          label={t('classDetail.language')}
          value={languagesLabel(session.instructionLanguages, t)}
        />
        <InfoRow
          icon={Tag}
          label={t('classDetail.price')}
          value={priceLabel(session, t, formatLocale)}
        />
        <InfoRow icon={Users} label={t('classDetail.availability')} value={spots} />
      </View>

      <View>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${t('classDetail.instructor')}: ${instructor.displayName}`}
          onPress={() => router.push(`/instructors/${instructor.id}`)}
          style={styles.row}
          testID="class-instructor"
        >
          <Avatar name={instructor.displayName} />
          <View style={styles.flex}>
            <AppText variant="footnote" color="textSecondary">
              {t('classDetail.instructor')}
            </AppText>
            <AppText variant="bodyStrong">{instructor.displayName}</AppText>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
        </PressableScale>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${t('classDetail.studio')}: ${organization.name}`}
          onPress={() => router.push(`/organizations/${organization.id}`)}
          style={styles.row}
          testID="class-studio"
        >
          <Avatar name={organization.name} tone={organization.tone} />
          <View style={styles.flex}>
            <AppText variant="footnote" color="textSecondary">
              {t('classDetail.studio')}
            </AppText>
            <AppText variant="bodyStrong">{organization.name}</AppText>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
        </PressableScale>
      </View>

      {/* Booking arrives in a later phase: an honest outline button and its reason. */}
      <View style={styles.book}>
        <Button
          label={t('classDetail.book')}
          variant="secondary"
          fullWidth
          disabled
          testID="book-class"
        />
        <AppText variant="footnote" color="textSecondary" align="center">
          {t('classDetail.bookingSoon')}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.surface,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.actionPrimary,
  },
  ticketTop: {
    gap: spacing.xs,
    padding: spacing.gutter,
  },
  perforation: {
    marginHorizontal: spacing.gutter,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderControl,
  },
  ticketBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    padding: spacing.gutter,
  },
  duration: {
    alignItems: 'flex-end',
    gap: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 64,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  flex: {
    flex: 1,
  },
  book: {
    gap: spacing.xs,
  },
});
