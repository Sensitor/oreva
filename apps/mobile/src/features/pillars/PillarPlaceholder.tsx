import { colors, radii, spacing } from '@oreva/tokens';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText, Card, Screen } from '@/ui';

export type Pillar = 'discover' | 'practice' | 'connect';

export interface PillarPlaceholderProps {
  pillar: Pillar;
  icon: LucideIcon;
}

/** Calm placeholder for a pillar tab until its phase is built. */
export function PillarPlaceholder({ pillar, icon: Icon }: PillarPlaceholderProps) {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        {t(`pillars.${pillar}.title`)}
      </AppText>
      <Card tone="backgroundTint" style={styles.card}>
        <View
          style={styles.icon}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Icon size={28} color={colors.textPrimary} strokeWidth={1.75} />
        </View>
        <AppText variant="title2">{t(`pillars.${pillar}.description`)}</AppText>
        <AppText variant="body" color="textOnPastelSecondary">
          {t('pillars.preparing')}
        </AppText>
        <View style={styles.soon}>
          <AppText variant="caption">{t('common.comingSoon')}</AppText>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soon: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
});
