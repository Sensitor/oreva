import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppleMap } from './AppleMap';
import { MAPBOX_TOKEN, MapboxMap } from './MapboxMap';
import type { DiscoverMapProps } from './types';

/** True when the Mapbox prototype can run (a public token is configured). */
export const mapboxConfigured = MAPBOX_TOKEN.length > 0;

/**
 * Chooses the map provider for the A/B prototype (decision note 0002). Mapbox
 * needs a public token; without one, Apple Maps is shown and Discover says so.
 */
export function DiscoverMap(props: DiscoverMapProps) {
  const { state } = usePrototypeStore();
  if (state.mapProvider === 'mapbox' && mapboxConfigured) {
    return <MapboxMap {...props} />;
  }
  return <AppleMap {...props} />;
}
