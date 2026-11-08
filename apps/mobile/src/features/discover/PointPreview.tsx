import { resolveLocalizedText, type MapPoint } from '@oreva/core';
import { colors, elevation, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { MapPin, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import type { ClassListItem } from '@/data/types';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { classWhen } from '@/lib/format';
import { AppText, PillButton, SampleBadge } from '@/ui';

export interface PointPreviewProps {
  point: MapPoint;
  /** Classes matching the current filters. */
  items: ClassListItem[];
  onClose: () => void;
}

/** Card shown when a place is selected on the map: who, where, next class. */
export function PointPreview({ point, items, onClose }: PointPreviewProps) {
  const { t } = useTranslation();
  const { locale, formatLocale } = useLocaleSettings();
  const venueItems = items.filter((item) => item.venue.id === point.venueId);
  const first = venueItems[0];

  if (!first) {
    return null;
  }

  const { organization, venue } = first;
  const when = classWhen(first.session, first.city, formatLocale);
  const isPrivate = venue.visibility === 'after_booking';

  return (
    <View style={styles.card} testID="point-preview">
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="headline" numberOfLines={1}>
            {organization.name}
          </AppText>
          <View style={styles.place}>
            <MapPin size={14} color={colors.textSecondary} strokeWidth={1.75} />
            <AppText variant="footnote" color="textSecondary" numberOfLines={1} style={styles.flex}>
              {resolveLocalizedText(venue.name, locale)?.text}
            </AppText>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          hitSlop={12}
        >
          <X size={22} color={colors.textPrimary} strokeWidth={1.75} />
        </Pressable>
      </View>
      <AppText variant="footnote" color={isPrivate ? 'info' : 'textSecondary'}>
        {isPrivate ? t('discover.privateArea') : t('discover.publicPlace')}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${resolveLocalizedText(first.session.title, locale, first.session.sourceLanguage)?.text ?? ''}, ${when.date} ${when.time}`}
        onPress={() => router.push(`/classes/${first.session.id}`)}
        style={({ pressed }) => [styles.next, pressed && styles.pressed]}
        testID="preview-next-class"
      >
        <AppText variant="bodyStrong" numberOfLines={1}>
          {resolveLocalizedText(first.session.title, locale, first.session.sourceLanguage)?.text}
        </AppText>
        <AppText variant="footnote" color="textOnPastelSecondary">
          {when.date} · {when.time} · {t('discover.upcomingClasses', { count: venueItems.length })}
        </AppText>
      </Pressable>
      <View style={styles.footer}>
        {point.isPlaceholder ? <SampleBadge /> : <View />}
        <PillButton
          label={t('discover.viewProfile')}
          withArrow
          onPress={() => router.push(`/organizations/${organization.id}`)}
          testID="preview-open-profile"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    boxShadow: elevation.floating,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  flex: {
    flex: 1,
  },
  next: {
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.backgroundTint,
    gap: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
