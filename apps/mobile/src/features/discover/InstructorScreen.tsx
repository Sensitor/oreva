import { resolveLocalizedText } from '@oreva/core';
import { colors, radii } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useInstructorProfile } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { languagesLabel } from '@/lib/format';
import {
  AppText,
  EmptyState,
  FictionalBanner,
  SampleBadge,
  Screen,
  ScreenHeader,
  Skeleton,
} from '@/ui';
import { DetailLayout, dropCap, Enter, FactStrip, Monogram, SpringPressable } from '@/ui/editorial';
import { ClassCard } from './ClassCard';
import { FollowButton } from './FollowButton';
import { PartnerSection, partnerStyles } from './PartnerParts';

const ENTER_AFTER = 100;

/**
 * An instructor (editorial direction). An instructor can teach for several
 * organizations (P-02). No portrait photograph until one used with
 * permission exists (P-15, C-8): the page opens on lilac with their initial.
 */
export function InstructorScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { data: profile, isLoading } = useInstructorProfile(id);

  if (isLoading) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <Skeleton height={240} radius={radii.cover} />
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
    <DetailLayout
      heroTestID="instructor-cover"
      hero={{ kind: 'type', tone: 'lilac', glyph: dropCap(instructor.displayName) }}
      trailing={<FollowButton kind="instructor" id={instructor.id} name={instructor.displayName} />}
    >
      <Enter index={0} after={ENTER_AFTER} style={partnerStyles.heading}>
        <View style={partnerStyles.kickerRow}>
          <AppText variant="kicker" color="textLink" style={partnerStyles.flex}>
            {t('classDetail.instructor')}
          </AppText>
          {instructor.isPlaceholder ? <SampleBadge /> : null}
        </View>
        <AppText variant="display" color="textBrand" accessibilityRole="header">
          {instructor.displayName}
        </AppText>
      </Enter>

      {instructor.isPlaceholder ? <FictionalBanner /> : null}

      <Enter index={1} after={ENTER_AFTER}>
        <FactStrip
          facts={[
            {
              label: t('organization.specialtiesLabel'),
              value: instructor.specialties.map((code) => t(`specialty.${code}`)).join(', '),
            },
            { label: t('instructor.speaks'), value: languagesLabel(instructor.spokenLanguages, t) },
          ]}
          testID="instructor-facts"
        />
      </Enter>

      <Enter index={2} after={ENTER_AFTER}>
        <PartnerSection title={t('instructor.about')}>
          <AppText variant="body">{resolveLocalizedText(instructor.bio, locale)?.text}</AppText>
        </PartnerSection>
      </Enter>

      <PartnerSection title={t('instructor.teachesAt')}>
        <View>
          {organizations.map((organization) => (
            <SpringPressable
              key={organization.id}
              accessibilityRole="button"
              accessibilityLabel={`${organization.name}, ${t(`orgType.${organization.type}`)}`}
              onPress={() => router.push(`/organizations/${organization.id}`)}
              pressedScale={0.98}
              style={partnerStyles.row}
              testID={`affiliation-${organization.id}`}
            >
              <Monogram name={organization.name} size={52} tone={organization.tone} />
              <View style={partnerStyles.flex}>
                <AppText variant="headline">{organization.name}</AppText>
                <AppText variant="footnote" color="textSecondary">
                  {t(`orgType.${organization.type}`)}
                </AppText>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
            </SpringPressable>
          ))}
        </View>
      </PartnerSection>

      <PartnerSection title={t('instructor.qualifications')}>
        <AppText variant="body">
          {resolveLocalizedText(instructor.qualificationsDeclared, locale)?.text}
        </AppText>
        <AppText variant="footnote" color="textSecondary">
          {t('instructor.qualificationsNote')}
        </AppText>
      </PartnerSection>

      <PartnerSection title={t('instructor.upcoming')}>
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
