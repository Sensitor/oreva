import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import type { ClassListItem } from '@/data/types';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { classWhen, priceLabel } from '@/lib/format';
import { useFontScale } from '@/theme/useFontScale';
import { AppText, Badge, NearIcon, PressableScale, SampleBadge } from '@/ui';

export interface ClassCardProps {
  item: ClassListItem;
  /** Distance label, e.g. "2.5 km", when searching near the member. */
  distance?: string;
  compact?: boolean;
}

/** From this text scale the stub sits above the details instead of beside them. */
const STACK_SCALE = 1.3;

/**
 * A class as a ticket: the stub holds the day and the time in serif numerals,
 * a perforated edge, then what, who and where. The whole ticket is one button
 * with a complete spoken label.
 */
export function ClassCard({ item, distance, compact }: ClassCardProps) {
  const { t } = useTranslation();
  const { locale, formatLocale } = useLocaleSettings();
  const fontScale = useFontScale();
  const stacked = fontScale >= STACK_SCALE;
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
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={[
        title,
        organization.name,
        `${when.date} ${when.time}`,
        place,
        distance,
        price,
        spots,
      ]
        .filter(Boolean)
        .join(', ')}
      onPress={() => router.push(`/classes/${session.id}`)}
      testID={`class-card-${session.id}`}
      style={[styles.ticket, compact && styles.compact]}
    >
      <View style={[styles.top, stacked && styles.topStacked]} testID={`ticket-top-${session.id}`}>
        <View style={[styles.stub, stacked && styles.stubStacked]}>
          <AppText variant="kicker" color="textLink" numberOfLines={1}>
            {when.date}
          </AppText>
          <AppText variant="numeralSmall" color="textBrand">
            {when.time}
          </AppText>
        </View>
        <View style={stacked ? styles.ruleHorizontal : styles.ruleVertical} />
        <View style={styles.details}>
          <AppText variant="headline" numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="footnote" color="textSecondary" numberOfLines={1}>
            {organization.name} · {instructor.displayName}
          </AppText>
          <View style={styles.place}>
            <NearIcon size={15} color={colors.textSecondary} />
            <AppText variant="footnote" color="textSecondary" numberOfLines={1} style={styles.flex}>
              {distance ? `${place} · ${distance}` : place}
            </AppText>
          </View>
        </View>
      </View>
      <View style={styles.bottom}>
        <View style={styles.tags}>
          <Badge label={t(`specialty.${session.specialty}`)} tone="surfaceMuted" />
          <Badge label={t(`level.${session.level}`)} tone="surfaceMuted" />
          {session.isPlaceholder ? <SampleBadge /> : null}
        </View>
        <View style={styles.footer}>
          <AppText variant="callout" weight="semibold">
            {price}
          </AppText>
          <AppText variant="callout" weight="semibold" color={full ? 'danger' : 'textBrand'}>
            {spots}
          </AppText>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  compact: {
    width: 300,
  },
  top: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  topStacked: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  stub: {
    minWidth: 76,
    gap: 2,
  },
  stubStacked: {
    minWidth: 0,
  },
  // The perforation between the stub and the details.
  ruleVertical: {
    width: 0,
    borderStartWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderControl,
  },
  ruleHorizontal: {
    height: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderControl,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: 2,
  },
  flex: {
    flex: 1,
  },
  bottom: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
