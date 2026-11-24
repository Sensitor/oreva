import { colors, radii, spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { isProduction } from '@/config/env';
import { AppText } from './AppText';

/**
 * Visible label on placeholder content in development and staging builds
 * (decision P-11): a small uppercase tag on paper, readable on any background.
 * Renders nothing in production, where placeholder content is blocked anyway.
 */
export function SampleBadge() {
  const { t } = useTranslation();
  if (isProduction) {
    return null;
  }
  return (
    <View style={styles.tag} accessible accessibilityLabel={t('a11y.sampleBadge')}>
      <AppText
        variant="caption"
        weight="semibold"
        color="textOnPastelSecondary"
        style={styles.text}
      >
        {t('common.sampleData')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.xs,
    paddingHorizontal: spacing.xs - 2,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.borderControl,
  },
  text: {
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
