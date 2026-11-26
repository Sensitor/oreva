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
  EmptyState,
  FictionalBanner,
  NearIcon,
  SampleBadge,
  Screen,
  ScreenHeader,
  Skeleton,
} from '@/ui';
import { DetailLayout, Enter, FactStrip, Monogram, SpringPressable } from '@/ui/editorial';
import { ClassCard } from './ClassCard';
import { FollowButton } from './FollowButton';
import { dropCap, PartnerSection, partnerStyles } from './PartnerParts';

const ENTER_AFTER = 100;

/**
 * A studio, community or independent instructor (P-01), in the editorial
 * direction. No photograph until one used with permission exists (C-8): the
 * page opens on the studio's tint with its initial as a drop cap.
 */
export function OrganizationScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { data: profile, isLoading } = useOrganizationProfile(id);

  if (isLoading) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <Skeleton height={240} radius={radii.cover} />
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
    <DetailLayout
      heroTestID="organization-cover"
      hero={{ kind: 'type', tone: organization.tone, glyph: dropCap(organization.name) }}
      trailing={<FollowButton kind="organization" id={organization.id} name={organization.name} />}
    >
      <Enter index={0} after={ENTER_AFTER} style={partnerStyles.heading}>
        <View style={partnerStyles.kickerRow}>
          <AppText variant="kicker" color="textLink" style={partnerStyles.flex}>
            {t(`orgType.${organization.type}`)} · {resolveLocalizedText(city.name, locale)?.text}
          </AppText>
          {organization.isPlaceholder ? <SampleBadge /> : null}
        </View>
        <AppText variant="display" color="textBrand" accessibilityRole="header">
          {organization.name}
        </AppText>
      </Enter>

      {organization.isPlaceholder ? <FictionalBanner /> : null}

      <Enter index={1} after={ENTER_AFTER}>
        <FactStrip
          facts={[
            {
              label: t('organization.specialtiesLabel'),
              value: organization.specialties.map((code) => t(`specialty.${code}`)).join(', '),
            },
            {
              label: t('organization.teachingLanguages'),
              value: languagesLabel(organization.instructionLanguages, t),
            },
          ]}
          testID="organization-facts"
        />
      </Enter>

      <Enter index={2} after={ENTER_AFTER}>
        <PartnerSection title={t('organization.about')}>
          <AppText variant="body">
            {resolveLocalizedText(organization.description, locale)?.text}
          </AppText>
        </PartnerSection>
      </Enter>

      <PartnerSection title={t('organization.places')}>
        <View>
          {venues.map((venue) => {
            const isPrivate = venue.visibility === 'after_booking';
            const Icon = isPrivate ? Lock : NearIcon;
            return (
              <View key={venue.id} style={styles.venue}>
                <Icon
                  size={20}
                  color={isPrivate ? colors.info : colors.textBrand}
                  strokeWidth={1.5}
                />
                <View style={partnerStyles.flex}>
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
        </View>
      </PartnerSection>

      <PartnerSection title={t('organization.instructors')}>
        {/* Monograms until photographs used with permission exist (P-15). */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.portraits}
        >
          {instructors.map((instructor) => {
            const specialties = instructor.specialties.map((s) => t(`specialty.${s}`)).join(', ');
            return (
              <SpringPressable
                key={instructor.id}
                accessibilityRole="button"
                accessibilityLabel={[instructor.displayName, specialties].join(', ')}
                onPress={() => router.push(`/instructors/${instructor.id}`)}
                pressedScale={0.96}
                style={styles.portrait}
                testID={`instructor-row-${instructor.id}`}
              >
                <Monogram name={instructor.displayName} size={80} tone={organization.tone} />
                <AppText variant="callout" weight="semibold" align="center" numberOfLines={2}>
                  {instructor.displayName}
                </AppText>
                <AppText variant="caption" color="textSecondary" align="center" numberOfLines={2}>
                  {specialties}
                </AppText>
              </SpringPressable>
            );
          })}
        </ScrollView>
      </PartnerSection>

      <PartnerSection title={t('organization.upcoming')}>
        {upcoming.length === 0 ? (
          <AppText variant="body" color="textSecondary">
            {t('organization.noUpcoming')}
          </AppText>
        ) : (
          <View>
            {upcoming.map((item) => (
              <ClassCard key={item.session.id} item={item} />
            ))}
          </View>
        )}
      </PartnerSection>
    </DetailLayout>
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
  bleed: {
    marginHorizontal: -spacing.gutter,
  },
  portraits: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
  portrait: {
    width: 108,
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
});
