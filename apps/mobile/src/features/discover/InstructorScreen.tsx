import { resolveLocalizedText } from '@oreva/core';
import { colors, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useInstructorProfile } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { languagesLabel } from '@/lib/format';
import {
  AppText,
  Avatar,
  EmptyState,
  FactsRow,
  FictionalBanner,
  Line,
  PressableScale,
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
      {/* A portrait in initials until a photo used with permission exists (P-15). */}
      <View style={styles.hero}>
        <Avatar name={instructor.displayName} size={112} tone="lilac" />
        <AppText variant="display" color="textBrand" accessibilityRole="header" align="center">
          {instructor.displayName}
        </AppText>
        <Line />
        {instructor.isPlaceholder ? <SampleBadge /> : null}
      </View>
      {instructor.isPlaceholder ? <FictionalBanner /> : null}

      <FactsRow
        facts={[
          {
            label: t('organization.specialtiesLabel'),
            value: instructor.specialties.map((code) => t(`specialty.${code}`)).join(', '),
          },
          { label: t('instructor.speaks'), value: languagesLabel(instructor.spokenLanguages, t) },
        ]}
        testID="instructor-facts"
      />

      <Section title={t('instructor.about')}>
        <AppText variant="body">{resolveLocalizedText(instructor.bio, locale)?.text}</AppText>
      </Section>

      <Section title={t('instructor.teachesAt')}>
        <View>
          {organizations.map((organization) => (
            <PressableScale
              key={organization.id}
              accessibilityRole="button"
              accessibilityLabel={`${organization.name}, ${t(`orgType.${organization.type}`)}`}
              onPress={() => router.push(`/organizations/${organization.id}`)}
              style={styles.row}
              testID={`affiliation-${organization.id}`}
            >
              <Avatar name={organization.name} size={40} tone={organization.tone} />
              <View style={styles.flex}>
                <AppText variant="bodyStrong">{organization.name}</AppText>
                <AppText variant="footnote" color="textSecondary">
                  {t(`orgType.${organization.type}`)}
                </AppText>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
            </PressableScale>
          ))}
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 64,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  flex: {
    flex: 1,
  },
});
