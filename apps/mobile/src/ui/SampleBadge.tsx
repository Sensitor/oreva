import { colors, radii, spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { isProduction } from '@/config/env';
import { AppText } from './AppText';

/**
 * Visible label on placeholder content in development and staging builds
 * (decision P-11). Renders nothing in production, where placeholder content is
 * blocked by the database anyway.
 */
export function SampleBadge() {
  const { t } = useTranslation();
  if (isProduction) {
    return null;
  }
  return (
    <View style={styles.badge} accessible accessibilityLabel={t('a11y.sampleBadge')}>
      <AppText variant="caption" color="textPrimary">
        {t('common.sampleData')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.borderControl,
  },
});
