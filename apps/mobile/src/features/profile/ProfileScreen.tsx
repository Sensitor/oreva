import { LOCALE_INFO } from '@oreva/i18n';
import { colors, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import {
  Accessibility,
  Bell,
  FlaskConical,
  Globe,
  Info,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { appVariant, appVersion, isProduction } from '@/config/env';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText, Badge, Card, LinkRow, PillButton, Screen, Section } from '@/ui';

/** Profile: account (next version), practice summary, following, settings. */
export function ProfileScreen() {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { state } = usePrototypeStore();

  // Read once when the screen opens, not on every render.
  const [openedAt] = useState(() => Date.now());
  const { week, total } = useMemo(() => {
    const weekAgo = openedAt - 7 * 86_400_000;
    return {
      total: state.completedWorkouts.length,
      week: state.completedWorkouts.filter((c) => new Date(c.completedAt).getTime() >= weekAgo)
        .length,
    };
  }, [state.completedWorkouts, openedAt]);

  const followingCount = state.followedInstructors.length + state.followedOrganizations.length;

  return (
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        {t('profile.title')}
      </AppText>

      <Card tone="backgroundTint" style={styles.guest}>
        <View style={styles.guestHeader}>
          <AppText variant="title2" style={styles.flex}>
            {t('profile2.guestTitle')}
          </AppText>
          <Badge label={t('profile2.soon')} />
        </View>
        <AppText variant="body" color="textOnPastelSecondary">
          {t('profile2.guestBody')}
        </AppText>
        <PillButton label={t('profile2.createAccount')} disabled />
      </Card>

      <Section title={t('profile2.yourPractice')}>
        <View style={styles.stats}>
          <Card tone="tileMint" style={styles.stat}>
            <AppText variant="display">{String(week)}</AppText>
            <AppText variant="footnote" color="textOnPastelSecondary">
              {t('profile2.sessionsWeek', { count: week })}
            </AppText>
          </Card>
          <Card tone="tileViolet" style={styles.stat}>
            <AppText variant="display">{String(total)}</AppText>
            <AppText variant="footnote" color="textOnPastelSecondary">
              {t('profile2.sessionsTotal', { count: total })}
            </AppText>
          </Card>
        </View>
      </Section>

      <Card padded={false}>
        <LinkRow
          icon={UsersRound}
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
  guest: {
    gap: spacing.sm,
  },
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  footer: {
    gap: spacing.xxs,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});
