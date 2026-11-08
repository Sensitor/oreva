import { colors, spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/ui';
import type { DiscoverMapProps } from './types';

/** Native map SDKs do not run on the web preview: Discover shows its list instead. */
export const mapboxConfigured = false;

export function DiscoverMap(_props: DiscoverMapProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.panel}>
      <AppText variant="callout" color="textOnPastelSecondary" align="center">
        {t('discover.mapUnavailable')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.backgroundTint,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
