import { coarsenLocation, type GeoPoint } from '@oreva/core';
import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { Linking } from 'react-native';

export type NearMeStatus = 'idle' | 'explaining' | 'locating' | 'denied' | 'ready' | 'error';

/**
 * "Near me" (decision P-12): we explain first, then ask for "while using the
 * app" permission, read a low-accuracy position, round it to about 1 km, and
 * keep it in memory only. It is never stored, logged or sent anywhere.
 */
export function useNearMe() {
  const [status, setStatus] = useState<NearMeStatus>('idle');
  const [area, setArea] = useState<GeoPoint | null>(null);

  const locate = useCallback(async () => {
    setStatus('locating');
    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const coarse = coarsenLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setArea(coarse);
      setStatus('ready');
      return coarse;
    } catch {
      setStatus('error');
      return null;
    }
  }, []);

  /** Called when the member taps "Near me". */
  const start = useCallback(async () => {
    const current = await Location.getForegroundPermissionsAsync();
    if (current.granted) {
      return locate();
    }
    setStatus(current.canAskAgain ? 'explaining' : 'denied');
    return null;
  }, [locate]);

  /** Called after our explanation, when the member agrees. */
  const confirm = useCallback(async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    if (!result.granted) {
      setStatus('denied');
      return null;
    }
    return locate();
  }, [locate]);

  const dismiss = useCallback(() => setStatus((s) => (s === 'ready' ? s : 'idle')), []);
  const clear = useCallback(() => {
    setArea(null);
    setStatus('idle');
  }, []);
  const openSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  return { status, area, start, confirm, dismiss, clear, openSettings };
}
