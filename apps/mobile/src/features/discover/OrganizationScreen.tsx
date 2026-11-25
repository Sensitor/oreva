import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useOrganizationProfile } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { languagesLabel } from '@/lib/format';
import {
  AppText,
  Avatar,
  EditorialCover,
  EmptyState,
  FactList,
  FictionalBanner,
  NearIcon,
  PressableScale,
  SampleBadge,
  Screen,
  ScreenHeader,
  Section,
  Skeleton,
} from '@/ui';
import { ClassCard } from './ClassCard';
import { FollowButton } from './FollowButton';

/** Public profile of a studio, community or independent instructor (P-01). */
export function OrganizationScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { data: profile, isLoading } = useOrganizationProfile(id);

  if (isLoading) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <Skeleton height={180} />
        <Skeleton height={120} />
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

  const { organization, city, venues, instructors, upcoming } = profile;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        trailing={
          <FollowButton kind="organization" id={organization.id} name={organization.name} />
        }
      />
      {/* No photography yet: a printed block until photos used with permission exist. */}
      <EditorialCover
        tone="paper"
        kicker={t(`orgType.${organization.type}`)}
        title={organization.name}
        meta={resolveLocalizedText(city.name, locale)?.text}
        badge={organization.isPlaceholder ? <SampleBadge /> : undefined}
        testID="organization-cover"
      />
      {organization.isPlaceholder ? <FictionalBanner /> : null}

      <FactList
        facts={[
          {
            label: t('organization.specialtiesLabel'),
            value: organization.specialties.map((code) => t(`specialty.${code}`)).join(', '),
          },
          {
            label: t('organization.teachingLanguages'),
            value: languagesLabel(organization.instructionLanguages, t),
          },
          {
            label: t('organization.places'),
            value: String(venues.length),
          },
        ]}
        testID="organization-facts"
      />

      <Section title={t('organization.about')}>
        <AppText variant="body">
          {resolveLocalizedText(organization.description, locale)?.text}
        </AppText>
      </Section>

      <Section title={t('organization.places')}>
        {venues.map((venue) => {
          const isPrivate = venue.visibility === 'after_booking';
          return (
            <View key={venue.id} style={styles.venue}>
              {isPrivate ? (
                <Lock size={20} color={colors.info} strokeWidth={1.5} />
              ) : (
                <NearIcon size={20} color={colors.textBrand} />
              )}
              <View style={styles.flex}>
                <AppText variant="bodyStrong">
                  {resolveLocalizedText(venue.name, locale)?.text}
                </AppText>
                <AppText variant="footnote" color={isPrivate ? 'info' : 'textSecondary'}>
                  {isPrivate ? t('discover.privateArea') : venue.addressLine}
                </AppText>
              </View>
            </View>
          );
        })}
      </Section>

      <Section title={t('organization.instructors')}>
        {/* Round portraits: initials until photos used with permission exist (P-15). */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.portraits}
        >
          {instructors.map((instructor) => {
            const specialties = instructor.specialties.map((s) => t(`specialty.${s}`)).join(', ');
            return (
              <PressableScale
                key={instructor.id}
                accessibilityRole="button"
                accessibilityLabel={[instructor.displayName, specialties].join(', ')}
                onPress={() => router.push(`/instructors/${instructor.id}`)}
                style={styles.portrait}
                testID={`instructor-row-${instructor.id}`}
              >
                <Avatar name={instructor.displayName} size={72} tone={organization.tone} />
                <AppText variant="callout" weight="semibold" align="center" numberOfLines={2}>
                  {instructor.displayName}
                </AppText>
                <AppText variant="caption" color="textSecondary" align="center" numberOfLines={2}>
                  {specialties}
                </AppText>
              </PressableScale>
            );
          })}
        </ScrollView>
      </Section>

      <Section title={t('organization.upcoming')}>
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
  venue: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  flex: {
    flex: 1,
  },
  portraits: {
    gap: spacing.md,
    paddingEnd: spacing.gutter,
  },
  portrait: {
    width: 104,
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
    borderRadius: radii.md,
  },
});
