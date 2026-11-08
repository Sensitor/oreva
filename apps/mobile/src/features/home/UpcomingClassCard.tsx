import { resolveLocalizedText } from '@oreva/core';
import { formatClassDateTime } from '@oreva/i18n';
import { colors, radii, spacing } from '@oreva/tokens';
import { Clock, MapPin, Sun } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { AppText, Card, SampleBadge } from '@/ui';
import type { SampleClass } from './sampleHomeData';

export interface UpcomingClassCardProps {
  item: SampleClass;
  onPress: () => void;
}

export function UpcomingClassCard({ item, onPress }: UpcomingClassCardProps) {
  const { t } = useTranslation();
  const { locale, formatLocale } = useLocaleSettings();
  const title = resolveLocalizedText(item.title, locale)?.text ?? '';
  const location = resolveLocalizedText(item.location, locale)?.text ?? '';
  // Classes are shown in the class's own time zone (Europe/Monaco), not the phone's.
  const when = formatClassDateTime(item.startsAt, formatLocale, item.timeZone);
  const spots = t('home.upcoming.spotsLeft', { count: item.spotsLeft });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${when.date} ${when.time}, ${location}, ${spots}`}
      accessibilityHint={t('home.upcoming.viewClass')}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <Card tone={item.tone} style={styles.card}>
        <View style={styles.badges}>
          <View style={styles.outdoor}>
            <Sun size={14} color={colors.textPrimary} strokeWidth={2} />
            <AppText variant="caption">{t('home.upcoming.outdoor')}</AppText>
          </View>
          {item.isPlaceholder ? <SampleBadge /> : null}
        </View>
        <AppText variant="headline" numberOfLines={2}>
          {title}
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
              style={styles.flexText}
            >
              {location}
            </AppText>
          </View>
        </View>
        <AppText variant="callout" weight="semibold">
          {spots}
        </AppText>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: 272,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  card: {
    gap: spacing.sm,
    minHeight: 200,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  outdoor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
  },
  meta: {
    gap: spacing.xxs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs - 2,
  },
  flexText: {
    flexShrink: 1,
  },
});
