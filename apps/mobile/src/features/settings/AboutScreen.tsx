import { colors, spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { appVariant, appVersion, isProduction } from '@/config/env';
import { AppText } from '@/ui';
import { SettingsPage } from './SettingsPage';

export function AboutScreen() {
  const { t } = useTranslation();
  return (
    <SettingsPage title={t('profile2.about')}>
      <View style={styles.brand}>
        <AppText variant="title1" color="textBrand">
          {t('app.name')}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {t('app.tagline')}
        </AppText>
        <AppText variant="footnote" color="textSecondary">
          {t('profile.version', { version: appVersion })}
          {!isProduction ? ` · ${t('profile.environment', { name: appVariant })}` : ''}
        </AppText>
      </View>
      <AppText variant="body">{t('aboutScreen.legal')}</AppText>
      {!isProduction ? (
        <AppText variant="footnote" color="info">
          {t('aboutScreen.demo')}
        </AppText>
      ) : null}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  brand: {
    gap: spacing.xxs,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderControl,
  },
});
