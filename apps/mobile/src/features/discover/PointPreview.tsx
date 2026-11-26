import { resolveLocalizedText, type MapPoint } from '@oreva/core';
import { colors, elevation, radii, spacing, touchTarget } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight, Lock, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import type { ClassListItem } from '@/data/types';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { classWhen } from '@/lib/format';
import { AppText, Button, NearIcon, SampleBadge } from '@/ui';
import { Monogram, SpringPressable } from '@/ui/editorial';

export interface PointPreviewProps {
  point: MapPoint;
  /** Classes matching the current filters. */
  items: ClassListItem[];
  onClose: () => void;
}

/**
 * The paper card that rises when a place is selected on the map: who (a
 * monogram, never a stock photograph), where (or only an approximate area),
 * the next class with its time in serif, and the way to the profile.
 */
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
  const nextTitle =
    resolveLocalizedText(first.session.title, locale, first.session.sourceLanguage)?.text ?? '';
  const PlaceIcon = isPrivate ? Lock : NearIcon;

  return (
    <View style={styles.card} testID="point-preview">
      <View style={styles.header}>
        <Monogram name={organization.name} size={52} tone={organization.tone} />
        <View style={styles.headerText}>
          <AppText variant="kicker" color="textLink" numberOfLines={1}>
            {t(`orgType.${organization.type}`)}
          </AppText>
          <AppText variant="title2" color="textPrimary" numberOfLines={2}>
            {organization.name}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <View style={styles.closeDot}>
            <X size={16} color={colors.textPrimary} strokeWidth={2} />
          </View>
        </Pressable>
      </View>

      <View style={styles.place}>
        <PlaceIcon
          size={15}
          color={isPrivate ? colors.info : colors.textSecondary}
          strokeWidth={1.5}
        />
        <AppText
          variant="footnote"
          color={isPrivate ? 'info' : 'textSecondary'}
          style={styles.flex}
          numberOfLines={2}
        >
          {isPrivate
            ? t('discover.privateArea')
            : `${resolveLocalizedText(venue.name, locale)?.text ?? ''} · ${t('discover.publicPlace')}`}
        </AppText>
      </View>

      {/* The next class: its time in serif, its title, how many more. */}
      <SpringPressable
        accessibilityRole="button"
        accessibilityLabel={`${nextTitle}, ${when.date} ${when.time}`}
        onPress={() => router.push(`/classes/${first.session.id}`)}
        pressedScale={0.98}
        style={styles.next}
        testID="preview-next-class"
      >
        <View style={styles.nextTime}>
          <AppText variant="caption" weight="semibold" color="textLink" numberOfLines={1}>
            {when.date}
          </AppText>
          <AppText variant="numeralSmall" color="textBrand">
            {when.time}
          </AppText>
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {nextTitle}
          </AppText>
          <AppText variant="footnote" color="textSecondary">
            {t('discover.upcomingClasses', { count: venueItems.length })}
          </AppText>
        </View>
        <ChevronRight size={18} color={colors.textSecondary} strokeWidth={1.5} />
      </SpringPressable>

      <View style={styles.footer}>
        {point.isPlaceholder ? <SampleBadge /> : <View />}
        <Button
          label={t('discover.viewProfile')}
          shape="pill"
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
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    boxShadow: elevation.raised,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  close: {
    width: touchTarget.min,
    height: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: -spacing.xs,
    alignSelf: 'flex-start',
  },
  closeDot: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  place: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xxs,
  },
  flex: {
    flex: 1,
  },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  nextTime: {
    minWidth: 68,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
