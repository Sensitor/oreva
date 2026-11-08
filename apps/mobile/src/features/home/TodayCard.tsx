import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { AppText, Card, PillButton, SampleBadge } from '@/ui';
import type { LocalizedText } from '@oreva/core';

export interface TodaySession {
  isPlaceholder: boolean;
  programTitle: LocalizedText;
  day: number;
  exercises: number;
  minutes: number;
}

export interface TodayCardProps {
  session: TodaySession;
  onStart: () => void;
}

/**
 * The "one clear next action" card (cahier des charges 1.4), inspired by the
 * reference's "Day 1" hero. Deep lavender with white text passes AA (5.76:1);
 * decorative shapes stay behind the end side, away from the text.
 */
export function TodayCard({ session, onStart }: TodayCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const title = resolveLocalizedText(session.programTitle, locale)?.text ?? '';

  return (
    <Card tone="accentStrong" style={styles.card}>
      <View
        style={styles.decor}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.circle, styles.circleLarge]} />
        <View style={[styles.circle, styles.circleSmall]} />
      </View>
      <View style={styles.topRow}>
        <AppText variant="caption" color="textOnAccentStrong" style={styles.eyebrow}>
          {t('home.today.label')}
        </AppText>
        {session.isPlaceholder ? <SampleBadge /> : null}
      </View>
      <View style={styles.text}>
        <AppText variant="display" color="textOnAccentStrong" accessibilityRole="header">
          {t('home.today.programDay', { day: session.day })}
        </AppText>
        <AppText variant="bodyStrong" color="textOnAccentStrong">
          {title}
        </AppText>
        <AppText variant="callout" color="textOnAccentStrong">
          {t('home.today.exercises', { count: session.exercises })} ·{' '}
          {t('common.durationMinutes', { count: session.minutes })}
        </AppText>
      </View>
      <PillButton
        label={t('home.today.start')}
        accessibilityLabel={t('a11y.startSession')}
        tone="light"
        withArrow
        onPress={onStart}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    minHeight: 236,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  text: {
    gap: spacing.xxs,
    maxWidth: '72%',
  },
  decor: {
    ...StyleSheet.absoluteFill,
  },
  circle: {
    position: 'absolute',
    borderRadius: radii.pill,
  },
  circleLarge: {
    width: 220,
    height: 220,
    end: -70,
    bottom: -80,
    backgroundColor: colors.accent,
    opacity: 0.45,
  },
  circleSmall: {
    width: 96,
    height: 96,
    end: 36,
    top: -30,
    backgroundColor: colors.accentSoft,
    opacity: 0.35,
  },
});
