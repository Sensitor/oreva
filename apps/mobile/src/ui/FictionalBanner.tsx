import { colors, radii, spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { isProduction } from '@/config/env';
import { AppText } from './AppText';
import { LotusIcon } from './icons';

/**
 * Shown at the top of every fictional profile (decision C-3), as a quiet sand band. Never rendered in
 * production builds, where demo data cannot exist.
 */
export function FictionalBanner() {
  const { t } = useTranslation();
  if (isProduction) {
    return null;
  }
  return (
    <View style={styles.banner} accessibilityRole="text" testID="fictional-banner">
      <LotusIcon size={18} color={colors.info} />
      <AppText variant="footnote" color="info" style={styles.text}>
        {t('common.fictionalBanner')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    flex: 1,
  },
});
