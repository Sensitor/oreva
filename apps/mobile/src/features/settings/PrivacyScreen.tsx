import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText, Card, LinkRow, Screen, ScreenHeader, ToggleRow } from '@/ui';

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
    <Screen withTabBar={false}>
      <ScreenHeader title={t('profile2.privacy')} />
      <Card padded={false}>
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
      </Card>
      <AppText variant="footnote" color="textSecondary">
        {t('privacyScreen.locationHint')}
      </AppText>
    </Screen>
  );
}
