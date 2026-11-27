import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText, LinkRow, ToggleRow } from '@/ui';
import { SettingsPage, settingsStyles } from './SettingsPage';

type LocationStatus = 'granted' | 'denied' | 'undetermined';

/** Privacy: Mapbox telemetry opt-out (required by Mapbox's terms) and location status (P-12). */
export function PrivacyScreen() {
  const { t } = useTranslation();
  const { state, update } = usePrototypeStore();
  const [status, setStatus] = useState<LocationStatus>('undetermined');

  useEffect(() => {
    Location.getForegroundPermissionsAsync()
      .then((result) =>
        setStatus(result.granted ? 'granted' : result.canAskAgain ? 'undetermined' : 'denied'),
      )
      .catch(() => undefined);
  }, []);

  const statusLabel = {
    granted: t('privacyScreen.statusGranted'),
    denied: t('privacyScreen.statusDenied'),
    undetermined: t('privacyScreen.statusUndetermined'),
  }[status];

  return (
    <SettingsPage title={t('profile2.privacy')}>
      <View style={settingsStyles.list}>
        <ToggleRow
          label={t('privacyScreen.mapTelemetry')}
          hint={t('privacyScreen.mapTelemetryHint')}
          value={state.mapTelemetryEnabled}
          onValueChange={(value) => update((s) => ({ ...s, mapTelemetryEnabled: value }))}
          testID="toggle-map-telemetry"
        />
        <LinkRow
          label={t('privacyScreen.location')}
          value={statusLabel}
          onPress={() => void Linking.openSettings()}
        />
      </View>
      <AppText variant="footnote" color="textSecondary">
        {t('privacyScreen.locationHint')}
      </AppText>
    </SettingsPage>
  );
}
