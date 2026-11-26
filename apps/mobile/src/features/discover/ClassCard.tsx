import { resolveLocalizedText } from '@oreva/core';
import { colors, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import type { ClassListItem } from '@/data/types';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { classWhen, priceLabel } from '@/lib/format';
import { useFontScale } from '@/theme/useFontScale';
import { AppText, NearIcon, SampleBadge } from '@/ui';
import { SpringPressable } from '@/ui/editorial';

export interface ClassCardProps {
  item: ClassListItem;
  /** Distance label, e.g. "2.5 km", when searching near the member. */
  distance?: string;
  /** Under a day heading the date is already said: only the time is shown. */
  hideDate?: boolean;
}

/** From this text scale the time sits above the details instead of beside them. */
const STACK_SCALE = 1.3;

/**
 * A class as a line of an editorial timetable: the time in serif at the
 * start, then what, who and where, and on the last line its kind and level,
 * the price and the places left. No photograph: a partner's class never wears
 * a stock picture (C-8). The whole line is one button with a complete label.
 */
export function ClassCard({ item, distance, hideDate }: ClassCardProps) {
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
    <SpringPressable
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
      pressedScale={0.985}
      testID={`class-card-${session.id}`}
      style={styles.row}
    >
      <View style={[styles.top, stacked && styles.topStacked]} testID={`ticket-top-${session.id}`}>
        <View style={[styles.time, stacked && styles.timeStacked]}>
          {hideDate ? null : (
            <AppText variant="caption" weight="semibold" color="textLink" numberOfLines={1}>
              {when.date}
            </AppText>
          )}
          <AppText variant="numeralSmall" color="textBrand">
            {when.time}
          </AppText>
        </View>
        <View style={styles.details}>
          <AppText variant="headline" numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="footnote" color="textSecondary" numberOfLines={1}>
            {organization.name} · {instructor.displayName}
          </AppText>
          <View style={styles.place}>
            <NearIcon size={14} color={colors.textSecondary} />
            <AppText variant="footnote" color="textSecondary" numberOfLines={1} style={styles.flex}>
              {distance ? `${place} · ${distance}` : place}
            </AppText>
          </View>
          <View style={styles.foot}>
            <AppText variant="footnote" color="textSecondary" style={styles.flex}>
              {t(`specialty.${session.specialty}`)} · {t(`level.${session.level}`)}
            </AppText>
            {session.isPlaceholder ? <SampleBadge /> : null}
          </View>
          <View style={styles.foot}>
            <AppText variant="callout" weight="semibold" style={styles.flex}>
              {price}
            </AppText>
            <AppText variant="footnote" weight="semibold" color={full ? 'danger' : 'textLink'}>
              {spots}
            </AppText>
          </View>
        </View>
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  top: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  topStacked: {
    flexDirection: 'column',
    gap: spacing.xxs,
  },
  time: {
    width: 76,
  },
  timeStacked: {
    width: 'auto',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  flex: {
    flex: 1,
  },
});
