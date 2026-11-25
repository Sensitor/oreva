import { LOCALE_INFO } from '@oreva/i18n';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import {
  Accessibility,
  Bell,
  FlaskConical,
  Globe,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { appVariant, appVersion, isProduction } from '@/config/env';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { weekOf, weekdayLabels } from '@/lib/week';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import {
  AppText,
  Button,
  Card,
  ConnectIcon,
  EditorialCover,
  EditorialHeader,
  LinkRow,
  WeekStones,
  Screen,
  Section,
} from '@/ui';

/** Profile: account (next version), practice summary, following, settings. */
export function ProfileScreen() {
  const { t } = useTranslation();
  const { locale, formatLocale } = useLocaleSettings();
  const { state } = usePrototypeStore();

  // Read once when the screen opens, not on every render.
  const [openedAt] = useState(() => Date.now());
  const { week, total, days } = useMemo(
    () => weekOf(state.completedWorkouts, openedAt),
    [state.completedWorkouts, openedAt],
  );
  const dayLabels = useMemo(() => weekdayLabels(formatLocale), [formatLocale]);

  const followingCount = state.followedInstructors.length + state.followedOrganizations.length;

  return (
    <Screen>
      <EditorialHeader title={t('profile.title')} />

      {/* Guest state: an invitation, honest about accounts arriving in the next version. */}
      <EditorialCover
        revealIndex={1}
        tone="sand"
        shapes
        kicker={t('profile2.soon')}
        title={t('profile2.guestTitle')}
        meta={t('profile2.guestBody')}
        testID="guest-card"
      >
        <Button label={t('profile2.createAccount')} variant="secondary" disabled />
      </EditorialCover>

      <Section title={t('profile2.yourPractice')} revealIndex={2}>
        {/* The week as seven cut-paper stones, filled only by sessions finished on this phone. */}
        <WeekStones
          days={days}
          labels={dayLabels}
          accessibilityLabel={t('profile2.sessionsWeek', { count: week })}
          testID="week-stones"
        />
        {total === 0 ? (
          // No "0 / 0": before the first session, an invitation to start one.
          <View style={styles.invite} testID="practice-invite">
            <AppText variant="title2" color="textBrand">
              {t('profile2.firstSessionTitle')}
            </AppText>
            <AppText variant="body" color="textSecondary">
              {t('profile2.firstSessionBody')}
            </AppText>
            <Button
              label={t('profile2.firstSessionCta')}
              variant="secondary"
              withArrow
              onPress={() => router.push('/practice')}
            />
          </View>
        ) : (
          // Real numbers from this phone only.
          <View style={styles.stats} testID="practice-stats">
            <View
              style={styles.stat}
              accessible
              accessibilityLabel={t('profile2.sessionsWeek', { count: week })}
            >
              <AppText variant="numeral" color="textBrand">
                {String(week)}
              </AppText>
              <AppText variant="footnote" color="textSecondary">
                {t('profile2.sessionsWeek', { count: week })}
              </AppText>
            </View>
            <View
              style={[styles.stat, styles.statDivided]}
              accessible
              accessibilityLabel={t('profile2.sessionsTotal', { count: total })}
            >
              <AppText variant="numeral" color="textBrand">
                {String(total)}
              </AppText>
              <AppText variant="footnote" color="textSecondary">
                {t('profile2.sessionsTotal', { count: total })}
              </AppText>
            </View>
          </View>
        )}
      </Section>

      <Card padded={false}>
        <LinkRow
          icon={ConnectIcon}
          label={t('profile2.following')}
          value={String(followingCount)}
          onPress={() => router.push('/connect')}
        />
      </Card>

      <Section title={t('profile2.settings')}>
        <Card padded={false}>
          <LinkRow
            icon={Globe}
            label={t('profile.language')}
            value={LOCALE_INFO[locale].nativeName}
            onPress={() => router.push('/language')}
            testID="profile-language"
          />
          <LinkRow
            icon={Bell}
            label={t('profile2.notifications')}
            onPress={() => router.push('/settings/notifications')}
            testID="profile-notifications"
          />
          <LinkRow
            icon={ShieldCheck}
            label={t('profile2.privacy')}
            onPress={() => router.push('/settings/privacy')}
            testID="profile-privacy"
          />
          <LinkRow
            icon={Accessibility}
            label={t('profile2.accessibility')}
            onPress={() => router.push('/settings/accessibility')}
          />
          <LinkRow
            icon={Info}
            label={t('profile2.about')}
            onPress={() => router.push('/settings/about')}
          />
        </Card>
      </Section>

      {!isProduction ? (
        <Card padded={false}>
          <LinkRow
            icon={FlaskConical}
            label={t('profile2.prototype')}
            onPress={() => router.push('/settings/prototype')}
            testID="profile-prototype"
          />
          <LinkRow
            icon={Sparkles}
            label={t('profile.designPreview')}
            onPress={() => router.push('/design-preview')}
          />
        </Card>
      ) : null}

      <View style={styles.footer}>
        <AppText variant="footnote" color="textSecondary" align="center">
          {t('app.tagline')}
        </AppText>
        <AppText variant="caption" color="textSecondary" align="center">
          {t('profile.version', { version: appVersion })}
        </AppText>
        {!isProduction ? (
          <AppText variant="caption" color="textSecondary" align="center">
            {t('profile.environment', { name: appVariant })}
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  invite: {
    gap: spacing.sm,
    padding: spacing.gutter,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  stat: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  statDivided: {
    borderStartWidth: StyleSheet.hairlineWidth,
    borderStartColor: colors.borderSubtle,
  },
  footer: {
    gap: spacing.xxs,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});
