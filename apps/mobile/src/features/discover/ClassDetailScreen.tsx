import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing, type TintName } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useClassDetail } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { classWhen, languagesLabel, priceLabel } from '@/lib/format';
import {
  AppText,
  Button,
  EmptyState,
  FictionalBanner,
  NearIcon,
  SampleBadge,
  Screen,
  ScreenHeader,
  Skeleton,
} from '@/ui';
import { DetailLayout, Enter, FactStrip, Monogram, SpringPressable } from '@/ui/editorial';

/** Content enters while the panel settles. */
const ENTER_AFTER = 100;

/**
 * A class (editorial direction). It opens on the studio's tint with the day
 * and the time in large serif, in the class's own time zone: the time is
 * the picture. Then what it is, the facts, where, who, and Book, shown
 * disabled with its reason until booking exists (never a fake booking).
 */
export function ClassDetailScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const { locale, formatLocale } = useLocaleSettings();
  const { data: item, isLoading } = useClassDetail(id);

  if (isLoading) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <Skeleton height={240} radius={radii.cover} />
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
  const title = resolveLocalizedText(session.title, locale, session.sourceLanguage)?.text ?? '';
  const when = classWhen(session, city, formatLocale);
  const isPrivate = venue.visibility === 'after_booking';
  const cityName = resolveLocalizedText(city.name, locale)?.text ?? '';
  const spots =
    session.spotsLeft > 0
      ? t('home.upcoming.spotsLeft', { count: session.spotsLeft })
      : t('classDetail.full');
  const PlaceIcon = isPrivate ? Lock : NearIcon;

  return (
    <DetailLayout
      heroTestID="class-ticket"
      hero={{
        kind: 'type',
        tone: organization.tone,
        children: (
          <View
            style={styles.when}
            accessible
            accessibilityLabel={[
              t('classDetail.when'),
              `${when.date} ${when.time}`,
              t('classDetail.localTime', { city: cityName }),
              t('classDetail.minutes', { count: session.durationMin }),
            ].join(', ')}
          >
            <AppText variant="kicker" color="textBrand">
              {when.date}
            </AppText>
            <View style={styles.timeRow}>
              <AppText variant="numeral" color="textBrand" style={styles.time}>
                {when.time}
              </AppText>
              <AppText variant="callout" weight="semibold" color="textBrand">
                {t('classDetail.minutes', { count: session.durationMin })}
              </AppText>
            </View>
            <AppText variant="footnote" color="textOnPastelSecondary">
              {t('classDetail.localTime', { city: cityName })}
            </AppText>
          </View>
        ),
      }}
    >
      <Enter index={0} after={ENTER_AFTER} style={styles.heading}>
        <View style={styles.kickerRow}>
          <AppText variant="kicker" color="textLink" style={styles.flex}>
            {t(`specialty.${session.specialty}`)}
          </AppText>
          {session.isPlaceholder ? <SampleBadge /> : null}
        </View>
        <AppText variant="display" color="textBrand" accessibilityRole="header">
          {title}
        </AppText>
        <AppText variant="callout" color="textSecondary">
          {organization.name} · {instructor.displayName}
        </AppText>
      </Enter>

      {session.isPlaceholder ? <FictionalBanner /> : null}

      <Enter index={1} after={ENTER_AFTER} style={styles.block}>
        <FactStrip
          facts={[
            { label: t('classDetail.level'), value: t(`level.${session.level}`) },
            {
              label: t('classDetail.language'),
              value: languagesLabel(session.instructionLanguages, t),
            },
            { label: t('classDetail.availability'), value: spots },
          ]}
          testID="class-facts"
        />
        <View
          style={styles.price}
          accessible
          accessibilityLabel={`${t('classDetail.price')}, ${priceLabel(session, t, formatLocale)}`}
        >
          <AppText variant="kicker" color="textSecondary">
            {t('classDetail.price')}
          </AppText>
          <AppText variant="title2" color="textPrimary">
            {priceLabel(session, t, formatLocale)}
          </AppText>
        </View>
      </Enter>

      <Enter index={2} after={ENTER_AFTER} style={styles.block}>
        <AppText variant="title2" color="textBrand" accessibilityRole="header">
          {t('classDetail.where')}
        </AppText>
        <View style={styles.place}>
          <PlaceIcon
            size={20}
            color={isPrivate ? colors.info : colors.textBrand}
            strokeWidth={1.5}
          />
          <View style={styles.flex}>
            <AppText variant="bodyStrong">{resolveLocalizedText(venue.name, locale)?.text}</AppText>
            <AppText variant="footnote" color={isPrivate ? 'info' : 'textSecondary'}>
              {isPrivate ? t('discover.privateArea') : (venue.addressLine ?? cityName)}
            </AppText>
          </View>
        </View>
      </Enter>

      <View>
        <PersonRow
          label={t('classDetail.instructor')}
          name={instructor.displayName}
          onPress={() => router.push(`/instructors/${instructor.id}`)}
          testID="class-instructor"
        />
        <PersonRow
          label={t('classDetail.studio')}
          name={organization.name}
          tone={organization.tone}
          onPress={() => router.push(`/organizations/${organization.id}`)}
          testID="class-studio"
        />
      </View>

      {/* Booking arrives in a later phase: an honest disabled button and its reason. */}
      <View style={styles.book}>
        <Button
          label={t('classDetail.book')}
          variant="secondary"
          shape="pill"
          fullWidth
          disabled
          testID="book-class"
        />
        <AppText variant="footnote" color="textSecondary" align="center">
          {t('classDetail.bookingSoon')}
        </AppText>
      </View>
    </DetailLayout>
  );
}

function PersonRow({
  label,
  name,
  tone,
  onPress,
  testID,
}: {
  label: string;
  name: string;
  tone?: TintName;
  onPress: () => void;
  testID: string;
}) {
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${name}`}
      onPress={onPress}
      pressedScale={0.98}
      style={styles.person}
      testID={testID}
    >
      <Monogram name={name} size={52} tone={tone} />
      <View style={styles.flex}>
        <AppText variant="caption" color="textSecondary">
          {label}
        </AppText>
        <AppText variant="headline">{name}</AppText>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  when: {
    position: 'absolute',
    start: spacing.gutter,
    end: spacing.gutter,
    bottom: spacing.xl + spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
  },
  time: {
    fontSize: 76,
    lineHeight: 84,
  },
  heading: {
    gap: spacing.xs,
  },
  kickerRow: {
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
  price: {
    gap: 2,
  },
  place: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 72,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  book: {
    gap: spacing.xs,
  },
});
