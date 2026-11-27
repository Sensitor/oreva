import { LOCALE_INFO } from '@oreva/i18n';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import {
  Accessibility,
  Bell,
  ChevronRight,
  FlaskConical,
  Globe,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appVariant, appVersion, isProduction } from '@/config/env';
import { useDirectory } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { weekOf, weekdayLabels } from '@/lib/week';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText, Button, LinkRow, TAB_BAR_CLEARANCE } from '@/ui';
import { Enter, Monogram, SpringPressable, WeekRings } from '@/ui/editorial';

/**
 * Profile, the member's own space (editorial direction): a membership card,
 * honest that accounts arrive in the next version; the week as seven rings
 * and the real numbers, from this phone only; who you follow; settings on
 * fine rules.
 */
export function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { locale, formatLocale } = useLocaleSettings();
  const { state } = usePrototypeStore();
  const directory = useDirectory();

  // Read once when the screen opens, not on every render.
  const [openedAt] = useState(() => Date.now());
  const { week, total, days } = useMemo(
    () => weekOf(state.completedWorkouts, openedAt),
    [state.completedWorkouts, openedAt],
  );
  const today = (new Date(openedAt).getDay() + 6) % 7;
  const dayLabels = useMemo(() => weekdayLabels(formatLocale), [formatLocale]);

  const followed = [
    ...(directory.data?.instructors ?? [])
      .filter((i) => state.followedInstructors.includes(i.id))
      .map((i) => ({ id: i.id, name: i.displayName, tone: 'lilac' as const })),
    ...(directory.data?.organizations ?? [])
      .filter((o) => state.followedOrganizations.includes(o.id))
      .map((o) => ({ id: o.id, name: o.name, tone: o.tone })),
  ];
  const followingCount = state.followedInstructors.length + state.followedOrganizations.length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: TAB_BAR_CLEARANCE + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Enter index={0}>
        <AppText
          variant="display"
          color="textBrand"
          accessibilityRole="header"
          style={styles.title}
        >
          {t('profile.title')}
        </AppText>
      </Enter>

      <Enter index={1}>
        <MemberCard />
      </Enter>

      <Enter index={2} style={styles.section}>
        <AppText variant="title2" color="textBrand" accessibilityRole="header">
          {t('profile2.yourPractice')}
        </AppText>
        <WeekRings
          days={days}
          labels={dayLabels}
          today={today}
          // Said once: by the week before the first session, by the numbers after.
          accessibilityLabel={total === 0 ? t('profile2.sessionsWeek', { count: week }) : undefined}
          testID="week-stones"
        />
        {total === 0 ? (
          // No "0 / 0": before the first session, an invitation to start one.
          <View style={styles.invite} testID="practice-invite">
            <AppText variant="headline">{t('profile2.firstSessionTitle')}</AppText>
            <AppText variant="body" color="textSecondary">
              {t('profile2.firstSessionBody')}
            </AppText>
            <View style={styles.inviteAction}>
              <Button
                label={t('profile2.firstSessionCta')}
                variant="secondary"
                shape="pill"
                withArrow
                onPress={() => router.push('/practice')}
              />
            </View>
          </View>
        ) : (
          // Real numbers from this phone only.
          <View style={styles.stats} testID="practice-stats">
            <Stat value={week} label={t('profile2.sessionsWeek', { count: week })} />
            <Stat value={total} label={t('profile2.sessionsTotal', { count: total })} divided />
          </View>
        )}
      </Enter>

      {/* Who you follow: their monograms laid like seals, and how many. */}
      <SpringPressable
        accessibilityRole="button"
        accessibilityLabel={`${t('profile2.following')}, ${String(followingCount)}`}
        onPress={() => router.push('/connect')}
        pressedScale={0.98}
        style={styles.following}
        testID="profile-following"
      >
        <View style={styles.seals}>
          {followed.slice(0, 4).map((person, index) => (
            <View key={person.id} style={index > 0 && styles.sealOverlap}>
              <Monogram name={person.name} size={44} tone={person.tone} />
            </View>
          ))}
        </View>
        <AppText variant="headline" style={styles.flex}>
          {t('profile2.following')}
        </AppText>
        <AppText variant="title2" color="textBrand">
          {String(followingCount)}
        </AppText>
        <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
      </SpringPressable>

      <View style={styles.section}>
        <AppText variant="title2" color="textBrand" accessibilityRole="header">
          {t('profile2.settings')}
        </AppText>
        <View style={styles.list}>
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
        </View>
      </View>

      {!isProduction ? (
        <View style={styles.list}>
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
        </View>
      ) : null}

      <View style={styles.footer}>
        <AppText variant="title2" color="textBrand" align="center">
          {t('app.name')}
        </AppText>
        <AppText variant="footnote" color="textSecondary" align="center">
          {t('app.tagline')}
        </AppText>
        <AppText variant="caption" color="textSecondary" align="center">
          {t('profile.version', { version: appVersion })}
          {!isProduction ? ` · ${t('profile.environment', { name: appVariant })}` : ''}
        </AppText>
      </View>
    </ScrollView>
  );
}

/**
 * The membership card, for a guest: sand, with ORÉVA's initial as a drop cap,
 * tone on tone. Honest that accounts arrive in the next version: the button
 * is shown disabled.
 */
function MemberCard() {
  const { t } = useTranslation();
  const { fontFamily } = useTheme();
  return (
    <View style={styles.card} testID="guest-card">
      <AppText
        style={[styles.cap, { fontFamily: fontFamily('medium', 'serif') }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        maxFontSizeMultiplier={1}
      >
        {t('app.name').charAt(0)}
      </AppText>
      <AppText variant="kicker" color="textBrand">
        {t('profile2.soon')}
      </AppText>
      <AppText variant="title1" color="textBrand">
        {t('profile2.guestTitle')}
      </AppText>
      <AppText variant="callout" color="textOnPastelSecondary" style={styles.cardBody}>
        {t('profile2.guestBody')}
      </AppText>
      <View style={styles.cardAction}>
        <Button label={t('profile2.createAccount')} variant="secondary" shape="pill" disabled />
      </View>
    </View>
  );
}

function Stat({ value, label, divided }: { value: number; label: string; divided?: boolean }) {
  return (
    <View
      style={[styles.stat, divided && styles.statDivided]}
      accessible
      accessibilityLabel={label}
    >
      <AppText variant="numeral" color="textBrand">
        {String(value)}
      </AppText>
      <AppText variant="footnote" color="textSecondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.xl,
  },
  title: {
    fontSize: 46,
    lineHeight: 52,
  },
  card: {
    overflow: 'hidden',
    gap: spacing.xs,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderRadius: radii.cover,
    backgroundColor: colors.tintSand,
  },
  // ORÉVA's initial, tone on tone, cut by the card's edge.
  cap: {
    position: 'absolute',
    end: -18,
    top: -46,
    fontSize: 230,
    lineHeight: 250,
    color: colors.textBrand,
    opacity: 0.08,
  },
  cardBody: {
    maxWidth: '88%',
  },
  cardAction: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  invite: {
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  inviteAction: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderControl,
  },
  stat: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  statDivided: {
    borderStartWidth: StyleSheet.hairlineWidth,
    borderStartColor: colors.borderSubtle,
  },
  following: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  seals: {
    flexDirection: 'row',
  },
  sealOverlap: {
    marginStart: -12,
  },
  flex: {
    flex: 1,
  },
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  footer: {
    gap: spacing.xxs,
    paddingTop: spacing.md,
  },
});
