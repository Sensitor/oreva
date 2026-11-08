import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight, Lock, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useOrganizationProfile } from '@/data/hooks';
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
      <Card tone={organization.tone} style={styles.hero}>
        <View style={styles.badges}>
          <Badge label={t(`orgType.${organization.type}`)} />
          {organization.isPlaceholder ? <SampleBadge /> : null}
        </View>
        <AppText variant="title1" accessibilityRole="header">
          {organization.name}
        </AppText>
        <AppText variant="callout" color="textOnPastelSecondary">
          {resolveLocalizedText(city.name, locale)?.text}
        </AppText>
      </Card>
      {organization.isPlaceholder ? <FictionalBanner /> : null}

      <Section title={t('organization.about')}>
        <AppText variant="body">
          {resolveLocalizedText(organization.description, locale)?.text}
        </AppText>
        <View style={styles.badges}>
          {organization.specialties.map((code) => (
            <Badge key={code} label={t(`specialty.${code}`)} tone="backgroundTint" />
          ))}
        </View>
        <AppText variant="footnote" color="textSecondary">
          {t('organization.teachingLanguages')}:{' '}
          {languagesLabel(organization.instructionLanguages, t)}
        </AppText>
      </Section>

      <Section title={t('organization.places')}>
        {venues.map((venue) => {
          const isPrivate = venue.visibility === 'after_booking';
          return (
            <Card key={venue.id} style={styles.venue}>
              {isPrivate ? (
                <Lock size={20} color={colors.info} strokeWidth={1.75} />
              ) : (
                <MapPin size={20} color={colors.textSecondary} strokeWidth={1.75} />
              )}
              <View style={styles.flex}>
                <AppText variant="bodyStrong">
                  {resolveLocalizedText(venue.name, locale)?.text}
                </AppText>
                <AppText variant="footnote" color={isPrivate ? 'info' : 'textSecondary'}>
                  {isPrivate ? t('discover.privateArea') : venue.addressLine}
                </AppText>
              </View>
            </Card>
          );
        })}
      </Section>

      <Section title={t('organization.instructors')}>
        <Card padded={false}>
          {instructors.map((instructor) => (
            <Pressable
              key={instructor.id}
              accessibilityRole="button"
              accessibilityLabel={instructor.displayName}
              onPress={() => router.push(`/instructors/${instructor.id}`)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              testID={`instructor-row-${instructor.id}`}
            >
              <Avatar name={instructor.displayName} />
              <View style={styles.flex}>
                <AppText variant="bodyStrong">{instructor.displayName}</AppText>
                <AppText variant="footnote" color="textSecondary" numberOfLines={1}>
                  {instructor.specialties.map((s) => t(`specialty.${s}`)).join(' · ')}
                </AppText>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
            </Pressable>
          ))}
        </Card>
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
  hero: {
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  venue: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    borderRadius: radii.sm,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
