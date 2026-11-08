import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import {
  CalendarClock,
  ChevronRight,
  Gauge,
  Languages,
  Lock,
  MapPin,
  Tag,
  Timer,
  Users,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useClassDetail } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { classWhen, languagesLabel, priceLabel } from '@/lib/format';
import {
  AppText,
  Avatar,
  Badge,
  Card,
  EmptyState,
  FictionalBanner,
  InfoRow,
  PillButton,
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

  return (
    <Screen withTabBar={false}>
      <ScreenHeader />
      <Card tone={organization.tone} style={styles.hero}>
        <View style={styles.badges}>
          <Badge label={t(`specialty.${session.specialty}`)} />
          {session.isPlaceholder ? <SampleBadge /> : null}
        </View>
        <AppText variant="title1" accessibilityRole="header">
          {title?.text}
        </AppText>
        <AppText variant="callout" color="textOnPastelSecondary">
          {organization.name}
        </AppText>
      </Card>
      {session.isPlaceholder ? <FictionalBanner /> : null}

      <Card>
        <InfoRow
          icon={CalendarClock}
          label={t('classDetail.when')}
          value={`${when.date} · ${when.time}`}
          detail={t('classDetail.localTime', { city: cityName })}
        />
        <InfoRow
          icon={Timer}
          label={t('classDetail.duration')}
          value={t('classDetail.minutes', { count: session.durationMin })}
        />
        <InfoRow
          icon={isPrivate ? Lock : MapPin}
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
        <InfoRow
          icon={Users}
          label={t('classDetail.availability')}
          value={
            session.spotsLeft > 0
              ? t('home.upcoming.spotsLeft', { count: session.spotsLeft })
              : t('classDetail.full')
          }
        />
      </Card>

      <Card padded={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('classDetail.instructor')}: ${instructor.displayName}`}
          onPress={() => router.push(`/instructors/${instructor.id}`)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          testID="class-instructor"
        >
          <Avatar name={instructor.displayName} />
          <View style={styles.flex}>
            <AppText variant="footnote" color="textSecondary">
              {t('classDetail.instructor')}
            </AppText>
            <AppText variant="bodyStrong">{instructor.displayName}</AppText>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('classDetail.studio')}: ${organization.name}`}
          onPress={() => router.push(`/organizations/${organization.id}`)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          testID="class-studio"
        >
          <View style={[styles.swatch, { backgroundColor: colors[organization.tone] }]} />
          <View style={styles.flex}>
            <AppText variant="footnote" color="textSecondary">
              {t('classDetail.studio')}
            </AppText>
            <AppText variant="bodyStrong">{organization.name}</AppText>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
        </Pressable>
      </Card>

      <View style={styles.book}>
        <PillButton label={t('classDetail.book')} fullWidth disabled testID="book-class" />
        <AppText variant="footnote" color="textSecondary" align="center">
          {t('classDetail.bookingSoon')}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  book: {
    gap: spacing.xs,
  },
});
