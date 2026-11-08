import { spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { AppText, Card, Screen, ScreenHeader } from '@/ui';

export function AccessibilityScreen() {
  const { t } = useTranslation();
  return (
    <Screen withTabBar={false}>
      <ScreenHeader title={t('profile2.accessibility')} />
      <Card style={styles.card}>
        <AppText variant="body">{t('accessibilityScreen.textSize')}</AppText>
        <AppText variant="body">{t('accessibilityScreen.motion')}</AppText>
        <AppText variant="body">{t('accessibilityScreen.screenReader')}</AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
});
