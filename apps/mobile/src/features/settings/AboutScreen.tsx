import { spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { appVariant, appVersion, isProduction } from '@/config/env';
import { AppText, Card, Screen, ScreenHeader } from '@/ui';

export function AboutScreen() {
  const { t } = useTranslation();
  return (
    <Screen withTabBar={false}>
      <ScreenHeader title={t('profile2.about')} />
      <Card style={styles.card}>
        <AppText variant="title2">{t('app.name')}</AppText>
        <AppText variant="body" color="textSecondary">
          {t('app.tagline')}
        </AppText>
        <AppText variant="footnote" color="textSecondary">
          {t('profile.version', { version: appVersion })}
        </AppText>
        {!isProduction ? (
          <AppText variant="footnote" color="textSecondary">
            {t('profile.environment', { name: appVariant })}
          </AppText>
        ) : null}
      </Card>
      <AppText variant="body">{t('aboutScreen.legal')}</AppText>
      {!isProduction ? (
        <AppText variant="footnote" color="info">
          {t('aboutScreen.demo')}
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
});
