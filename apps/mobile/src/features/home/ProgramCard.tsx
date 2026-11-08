import { resolveLocalizedText } from '@oreva/core';
import { spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { AppText, Card, SampleBadge } from '@/ui';
import type { SampleProgram } from './sampleHomeData';

export function ProgramCard({ program }: { program: SampleProgram }) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  return (
    <Card tone={program.tone} style={styles.card}>
      {program.isPlaceholder ? <SampleBadge /> : null}
      <AppText variant="headline" numberOfLines={3}>
        {resolveLocalizedText(program.title, locale)?.text ?? ''}
      </AppText>
      <AppText variant="footnote" color="textOnPastelSecondary">
        {t('home.programs.weeks', { count: program.weeks })}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.xs,
    minHeight: 150,
  },
});
