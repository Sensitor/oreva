import { dayPeriod } from '@oreva/core';
import { spacing } from '@oreva/tokens';
import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText, Chip, IconButton, Screen, SectionHeader } from '@/ui';
import { ProgramCard } from './ProgramCard';
import {
  CATEGORY_KEYS,
  sampleClasses,
  samplePrograms,
  sampleToday,
  type CategoryKey,
} from './sampleHomeData';
import { TodayCard } from './TodayCard';
import { UpcomingClassCard } from './UpcomingClassCard';

function deviceTimeZone(): string {
  try {
    return getCalendars()[0]?.timeZone ?? 'UTC';
  } catch {
    return 'UTC';
  }
}

export interface HomeScreenProps {
  /** Injected in tests for a stable greeting and dates. */
  now?: Date;
}

/**
 * Static Phase 1 Home, faithful to the visual reference. Real data arrives with
 * Phases 2 to 5; until then every content card is labelled as sample data.
 */
export function HomeScreen({ now }: HomeScreenProps) {
  const { t } = useTranslation();
  const [category, setCategory] = useState<CategoryKey>('all');
  const current = useMemo(() => now ?? new Date(), [now]);
  const period = dayPeriod(current, deviceTimeZone());
  const classes = useMemo(() => sampleClasses(current), [current]);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="callout" color="textSecondary">
            {t(`home.greeting.${period}`)}
          </AppText>
          <AppText variant="headline" style={styles.wordmark}>
            {t('app.name')}
          </AppText>
        </View>
        <IconButton icon={Bell} accessibilityLabel={t('a11y.notifications')} />
      </View>

      <AppText variant="display" accessibilityRole="header">
        {t('home.headline')}
      </AppText>

      <TodayCard session={sampleToday} onStart={() => router.push('/practice')} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.bleed}
        contentContainerStyle={styles.chips}
      >
        {CATEGORY_KEYS.map((key) => (
          <Chip
            key={key}
            label={t(`home.categories.${key}`)}
            selected={category === key}
            onPress={() => setCategory(key)}
          />
        ))}
      </ScrollView>

      <View>
        <SectionHeader
          title={t('home.upcoming.title')}
          actionLabel={t('common.seeAll')}
          onAction={() => router.push('/discover')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.carousel}
        >
          {classes.map((item) => (
            <UpcomingClassCard key={item.id} item={item} onPress={() => router.push('/discover')} />
          ))}
        </ScrollView>
      </View>

      <View>
        <SectionHeader
          title={t('home.programs.title')}
          actionLabel={t('common.seeAll')}
          onAction={() => router.push('/practice')}
        />
        <View style={styles.programs}>
          {samplePrograms.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    gap: 2,
  },
  wordmark: {
    letterSpacing: 2,
  },
  bleed: {
    marginHorizontal: -(spacing.lg - 4),
  },
  chips: {
    paddingHorizontal: spacing.lg - 4,
    gap: spacing.xs,
  },
  carousel: {
    paddingHorizontal: spacing.lg - 4,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  programs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
