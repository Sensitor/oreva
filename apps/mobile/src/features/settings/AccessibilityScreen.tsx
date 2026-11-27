import { colors, spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/ui';
import { SettingsPage } from './SettingsPage';

export function AccessibilityScreen() {
  const { t } = useTranslation();
  const points = [
    t('accessibilityScreen.textSize'),
    t('accessibilityScreen.motion'),
    t('accessibilityScreen.screenReader'),
  ];
  return (
    <SettingsPage title={t('profile2.accessibility')}>
      <View>
        {points.map((point) => (
          <View key={point} style={styles.point}>
            <AppText variant="body">{point}</AppText>
          </View>
        ))}
      </View>
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  point: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
});
