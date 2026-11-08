import { resolveLocalizedText } from '@oreva/core';
import { colors, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { Clock, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import type { ClassListItem } from '@/data/types';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { classWhen, priceLabel } from '@/lib/format';
import { AppText, Badge, Card, SampleBadge } from '@/ui';

export interface ClassCardProps {
  item: ClassListItem;
  /** Distance label, e.g. "2.5 km", when searching near the member. */
  distance?: string;
  compact?: boolean;
}

export function ClassCard({ item, distance, compact }: ClassCardProps) {
  const { t } = useTranslation();
  const { locale, formatLocale } = useLocaleSettings();
  const { session, organization, instructor, venue, city } = item;
  const title = resolveLocalizedText(session.title, locale, session.sourceLanguage)?.text ?? '';
  const place = resolveLocalizedText(venue.name, locale)?.text ?? '';
  const when = classWhen(session, city, formatLocale);
  const spots =
    session.spotsLeft > 0
      ? t('home.upcoming.spotsLeft', { count: session.spotsLeft })
      : t('classDetail.full');
  const price = priceLabel(session, t, formatLocale);

  return (
    <Pressable
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
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card tone={organization.tone} style={[styles.card, compact && styles.compact]}>
        <View style={styles.badges}>
          <Badge label={t(`specialty.${session.specialty}`)} />
          <Badge label={t(`level.${session.level}`)} />
          {session.isPlaceholder ? <SampleBadge /> : null}
        </View>
        <AppText variant="headline" numberOfLines={2}>
          {title}
        </AppText>
        <AppText variant="footnote" color="textOnPastelSecondary" numberOfLines={1}>
          {organization.name} · {instructor.displayName}
        </AppText>
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Clock size={16} color={colors.textOnPastelSecondary} strokeWidth={1.75} />
            <AppText variant="footnote" color="textOnPastelSecondary">
              {when.date} · {when.time}
            </AppText>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={16} color={colors.textOnPastelSecondary} strokeWidth={1.75} />
            <AppText
              variant="footnote"
              color="textOnPastelSecondary"
              numberOfLines={1}
              style={styles.flex}
            >
              {distance ? `${place} · ${distance}` : place}
            </AppText>
          </View>
        </View>
        <View style={styles.footer}>
          <AppText variant="callout" weight="semibold">
            {price}
          </AppText>
          <AppText variant="callout" weight="semibold">
            {spots}
          </AppText>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  compact: {
    width: 280,
  },
  pressed: {
    opacity: 0.9,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  meta: {
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs + 2,
  },
  flex: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
