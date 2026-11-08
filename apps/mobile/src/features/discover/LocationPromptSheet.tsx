import { colors, radii, spacing } from '@oreva/tokens';
import { LocateFixed } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText, PillButton, Sheet } from '@/ui';
import type { NearMeStatus } from './useNearMe';

export interface LocationPromptSheetProps {
  status: NearMeStatus;
  onAllow: () => void;
  onChooseCity: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

/**
 * Explains why ORÉVA wants the location before the system prompt appears, and
 * what to do when it was refused (decision P-12). A city can always be chosen.
 */
export function LocationPromptSheet({
  status,
  onAllow,
  onChooseCity,
  onOpenSettings,
  onClose,
}: LocationPromptSheetProps) {
  const { t } = useTranslation();
  const visible = status === 'explaining' || status === 'denied';
  return (
    <Sheet visible={visible} title={t('discover.locationTitle')} onClose={onClose}>
      <View style={styles.icon}>
        <LocateFixed size={32} color={colors.textPrimary} strokeWidth={1.75} />
      </View>
      {status === 'denied' ? (
        <>
          <AppText variant="body" testID="location-denied">
            {t('discover.locationDenied')}
          </AppText>
          <PillButton label={t('discover.openSettings')} onPress={onOpenSettings} fullWidth />
          <PillButton
            label={t('discover.chooseCity')}
            tone="light"
            onPress={onChooseCity}
            fullWidth
          />
        </>
      ) : (
        <>
          <AppText variant="body">{t('discover.locationBody')}</AppText>
          <PillButton
            label={t('discover.locationAllow')}
            onPress={onAllow}
            fullWidth
            testID="location-allow"
          />
          <PillButton
            label={t('discover.locationNotNow')}
            tone="light"
            onPress={onClose}
            fullWidth
          />
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: colors.backgroundTint,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: spacing.md,
  },
});
