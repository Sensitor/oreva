import { resolveLocalizedText } from '@oreva/core';
import { colors, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useInstructorProfile } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { languagesLabel } from '@/lib/format';
import {
  AppText,
  Avatar,
  Badge,
  Card,
  EmptyState,
  FictionalBanner,
  SampleBadge,
  Screen,
  ScreenHeader,
  Section,
  Skeleton,
} from '@/ui';
import { ClassCard } from './ClassCard';
import { FollowButton } from './FollowButton';

/** Public instructor profile. An instructor can teach for several organizations (P-02). */
export function InstructorScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { data: profile, isLoading } = useInstructorProfile(id);

  if (isLoading) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <Skeleton height={200} />
      </Screen>
    );
  }
  if (!profile) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <EmptyState title={t('errors.generic')} />
      </Screen>
    );
  }

  const { instructor, organizations, upcoming } = profile;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        trailing={
          <FollowButton kind="instructor" id={instructor.id} name={instructor.displayName} />
        }
      />
      <View style={styles.hero}>
        <Avatar name={instructor.displayName} size={96} />
        <AppText variant="title1" accessibilityRole="header" align="center">
          {instructor.displayName}
        </AppText>
        {instructor.isPlaceholder ? <SampleBadge /> : null}
      </View>
      {instructor.isPlaceholder ? <FictionalBanner /> : null}

      <Section title={t('instructor.about')}>
        <AppText variant="body">{resolveLocalizedText(instructor.bio, locale)?.text}</AppText>
        <View style={styles.badges}>
          {instructor.specialties.map((code) => (
            <Badge key={code} label={t(`specialty.${code}`)} tone="backgroundTint" />
          ))}
        </View>
        <AppText variant="footnote" color="textSecondary">
          {t('instructor.speaks')}: {languagesLabel(instructor.spokenLanguages, t)}
        </AppText>
      </Section>

      <Section title={t('instructor.teachesAt')}>
        <Card padded={false}>
          {organizations.map((organization) => (
            <Pressable
              key={organization.id}
              accessibilityRole="button"
              accessibilityLabel={`${organization.name}, ${t(`orgType.${organization.type}`)}`}
              onPress={() => router.push(`/organizations/${organization.id}`)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              testID={`affiliation-${organization.id}`}
            >
              <View style={[styles.swatch, { backgroundColor: colors[organization.tone] }]} />
              <View style={styles.flex}>
                <AppText variant="bodyStrong">{organization.name}</AppText>
                <AppText variant="footnote" color="textSecondary">
                  {t(`orgType.${organization.type}`)}
                </AppText>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
            </Pressable>
          ))}
        </Card>
      </Section>

      <Section title={t('instructor.qualifications')}>
        <AppText variant="body">
          {resolveLocalizedText(instructor.qualificationsDeclared, locale)?.text}
        </AppText>
        <AppText variant="footnote" color="textSecondary">
          {t('instructor.qualificationsNote')}
        </AppText>
      </Section>

      <Section title={t('instructor.upcoming')}>
        {upcoming.length === 0 ? (
          <AppText variant="body" color="textSecondary">
            {t('organization.noUpcoming')}
          </AppText>
        ) : (
          upcoming.map((item) => <ClassCard key={item.session.id} item={item} />)
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
