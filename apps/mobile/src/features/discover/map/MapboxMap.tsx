import { circleRing } from '@oreva/core';
import { colors } from '@oreva/tokens';
import {
  Camera,
  CircleLayer,
  FillLayer,
  LineLayer,
  MapView,
  ShapeSource,
  SymbolLayer,
  setAccessToken,
  setTelemetryEnabled,
} from '@rnmapbox/maps';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import type { DiscoverMapProps } from './types';

export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';
// A custom ORÉVA style made in Mapbox Studio can replace this light base style.
const STYLE_URL = process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/light-v11';

if (MAPBOX_TOKEN) {
  void setAccessToken(MAPBOX_TOKEN);
}

/**
 * Discover map on Mapbox (decision note 0002): native clustering, approximate
 * areas for private venues, brand colours. The attribution control stays
 * visible because it carries Mapbox's telemetry opt-out (their terms); the same
 * opt-out is also in Profile, Privacy.
 */
export function MapboxMap({
  points,
  selectedPointId,
  onSelectPoint,
  camera,
  userArea,
  reduceMotion,
  labels,
}: DiscoverMapProps) {
  const { locale } = useLocaleSettings();
  const { state } = usePrototypeStore();
  const cameraRef = useRef<Camera>(null);
  const sourceRef = useRef<ShapeSource>(null);

  useEffect(() => {
    setTelemetryEnabled(state.mapTelemetryEnabled);
  }, [state.mapTelemetryEnabled]);

  useEffect(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: [camera.center.longitude, camera.center.latitude],
      zoomLevel: camera.zoom,
      animationDuration: reduceMotion ? 0 : 900,
      animationMode: reduceMotion ? 'none' : 'flyTo',
    });
  }, [camera, reduceMotion]);

  const pointShape = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: points.map((point) => ({
        type: 'Feature' as const,
        id: point.id,
        properties: { id: point.id, approximate: point.approximateRadiusMeters !== null },
        geometry: {
          type: 'Point' as const,
          coordinates: [point.coordinate.longitude, point.coordinate.latitude],
        },
      })),
    }),
    [points],
  );

  const areaShape = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: [
        ...points
          .filter((point) => point.approximateRadiusMeters !== null)
          .map((point) => ({
            type: 'Feature' as const,
            id: point.id,
            properties: { id: point.id, kind: 'venue' },
            geometry: {
              type: 'Polygon' as const,
              coordinates: [
                circleRing(point.coordinate, point.approximateRadiusMeters ?? 0).map((p) => [
                  p.longitude,
                  p.latitude,
                ]),
              ],
            },
          })),
        ...(userArea
          ? [
              {
                type: 'Feature' as const,
                id: 'user-area',
                properties: { id: 'user-area', kind: 'user' },
                geometry: {
                  type: 'Polygon' as const,
                  coordinates: [circleRing(userArea, 1000).map((p) => [p.longitude, p.latitude])],
                },
              },
            ]
          : []),
      ],
    }),
    [points, userArea],
  );

  const selectById = (id: unknown) => {
    const point = points.find((p) => p.id === id);
    onSelectPoint(point ?? null);
  };

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      styleURL={STYLE_URL}
      accessibilityLabel={labels.map}
      logoEnabled
      attributionEnabled
      // Mapbox API prop (screen position of the attribution), not a layout style.
      // eslint-disable-next-line no-restricted-syntax
      attributionPosition={{ bottom: 8, left: 8 }}
      scaleBarEnabled={false}
      compassEnabled={false}
      pitchEnabled={false}
      localizeLabels={{ locale }}
      onPress={() => onSelectPoint(null)}
    >
      <Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: [camera.center.longitude, camera.center.latitude],
          zoomLevel: camera.zoom,
        }}
      />
      <ShapeSource
        id="oreva-areas"
        shape={areaShape}
        onPress={(event) => selectById(event.features[0]?.properties?.id)}
      >
        <FillLayer
          id="oreva-area-fill"
          style={{
            fillColor: ['match', ['get', 'kind'], 'user', colors.info, colors.accentSoft],
            fillOpacity: ['match', ['get', 'kind'], 'user', 0.12, 0.35],
          }}
        />
        <LineLayer
          id="oreva-area-outline"
          style={{
            lineColor: ['match', ['get', 'kind'], 'user', colors.info, colors.accentStrong],
            lineWidth: ['case', ['==', ['get', 'id'], selectedPointId ?? ''], 3, 1.5],
            lineDasharray: [2, 2],
          }}
        />
      </ShapeSource>
      <ShapeSource
        id="oreva-points"
        ref={sourceRef}
        shape={pointShape}
        cluster
        clusterRadius={44}
        clusterMaxZoomLevel={13}
        onPress={async (event) => {
          const feature = event.features[0];
          if (!feature) {
            return;
          }
          if (feature.properties?.cluster) {
            const zoom = await sourceRef.current?.getClusterExpansionZoom(feature as never);
            const geometry = feature.geometry;
            const coords: [number, number] =
              geometry.type === 'Point'
                ? [
                    geometry.coordinates[0] ?? camera.center.longitude,
                    geometry.coordinates[1] ?? camera.center.latitude,
                  ]
                : [camera.center.longitude, camera.center.latitude];
            cameraRef.current?.setCamera({
              centerCoordinate: coords,
              zoomLevel: (zoom ?? camera.zoom) + 0.5,
              animationDuration: reduceMotion ? 0 : 600,
            });
            return;
          }
          selectById(feature.properties?.id);
        }}
      >
        <CircleLayer
          id="oreva-clusters"
          filter={['has', 'point_count']}
          style={{
            circleColor: colors.accent,
            circleRadius: ['step', ['get', 'point_count'], 18, 10, 22, 100, 28],
            circleStrokeColor: colors.surface,
            circleStrokeWidth: 3,
          }}
        />
        <SymbolLayer
          id="oreva-cluster-count"
          filter={['has', 'point_count']}
          style={{
            textField: ['get', 'point_count_abbreviated'],
            textSize: 14,
            textColor: colors.textPrimary,
            textAllowOverlap: true,
          }}
        />
        <CircleLayer
          id="oreva-public-points"
          filter={['all', ['!', ['has', 'point_count']], ['==', ['get', 'approximate'], false]]}
          style={{
            circleColor: colors.accent,
            circleRadius: ['case', ['==', ['get', 'id'], selectedPointId ?? ''], 13, 9],
            circleStrokeColor: colors.textPrimary,
            circleStrokeWidth: ['case', ['==', ['get', 'id'], selectedPointId ?? ''], 3, 1.5],
          }}
        />
        <CircleLayer
          id="oreva-private-points"
          filter={['all', ['!', ['has', 'point_count']], ['==', ['get', 'approximate'], true]]}
          style={{
            // A hollow ring: never a pin, the exact point is not known (P-12).
            circleColor: 'rgba(0,0,0,0)',
            circleRadius: 10,
            circleStrokeColor: colors.accentStrong,
            circleStrokeWidth: ['case', ['==', ['get', 'id'], selectedPointId ?? ''], 3.5, 2],
          }}
        />
      </ShapeSource>
    </MapView>
  );
}
