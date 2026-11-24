import { colors, elevation, radii } from '@oreva/tokens';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, type Region } from 'react-native-maps';
import { AppText } from '@/ui';
import { clusterOnGrid } from './clusterGrid';
import { longitudeDeltaForZoom, type DiscoverMapProps } from './types';

function regionFor(center: { latitude: number; longitude: number }, zoom: number): Region {
  const longitudeDelta = longitudeDeltaForZoom(zoom);
  return { ...center, longitudeDelta, latitudeDelta: longitudeDelta * 0.8 };
}

/**
 * Discover map on Apple Maps (iOS) / Google Maps (Android) through
 * react-native-maps, for the A/B comparison (decision note 0002). Apple Maps
 * cannot take a custom style, so the muted standard map is used.
 */
export function AppleMap({
  points,
  selectedPointId,
  onSelectPoint,
  camera,
  userArea,
  reduceMotion,
  labels,
}: DiscoverMapProps) {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(() => regionFor(camera.center, camera.zoom));

  useEffect(() => {
    mapRef.current?.animateToRegion(regionFor(camera.center, camera.zoom), reduceMotion ? 0 : 800);
  }, [camera, reduceMotion]);

  const items = useMemo(
    () => clusterOnGrid(points, region.longitudeDelta),
    [points, region.longitudeDelta],
  );

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={region}
      onRegionChangeComplete={setRegion}
      mapType="mutedStandard"
      showsPointsOfInterests={false}
      showsCompass={false}
      pitchEnabled={false}
      toolbarEnabled={false}
      accessibilityLabel={labels.map}
      onPress={(event) => {
        if (event.nativeEvent.action !== 'marker-press') {
          onSelectPoint(null);
        }
      }}
    >
      {points
        .filter((point) => point.approximateRadiusMeters !== null)
        .map((point) => (
          <Circle
            key={`area-${point.id}`}
            center={point.coordinate}
            radius={point.approximateRadiusMeters ?? 0}
            fillColor="rgba(110, 83, 144, 0.10)"
            strokeColor={colors.progress}
            strokeWidth={point.id === selectedPointId ? 3 : 1.5}
            lineDashPattern={[6, 6]}
          />
        ))}
      {userArea ? (
        <Circle
          center={userArea}
          radius={1000}
          fillColor="rgba(110, 83, 144, 0.08)"
          strokeColor={colors.info}
          strokeWidth={1.5}
        />
      ) : null}
      {items.map((item) =>
        item.kind === 'cluster' ? (
          <Marker
            key={item.id}
            coordinate={item.coordinate}
            tracksViewChanges={false}
            accessibilityLabel={labels.cluster(item.count)}
            onPress={() =>
              mapRef.current?.animateToRegion(
                {
                  ...item.coordinate,
                  longitudeDelta: region.longitudeDelta / 3,
                  latitudeDelta: region.latitudeDelta / 3,
                },
                reduceMotion ? 0 : 500,
              )
            }
          >
            <View style={styles.cluster}>
              <AppText variant="title2" color="textBrand" maxFontSizeMultiplier={1}>
                {String(item.count)}
              </AppText>
            </View>
          </Marker>
        ) : (
          <Marker
            key={item.id}
            coordinate={item.coordinate}
            tracksViewChanges={false}
            accessibilityLabel={labels.point(item.point)}
            onPress={() => onSelectPoint(item.point)}
          >
            <View
              style={[
                item.point.approximateRadiusMeters === null ? styles.point : styles.area,
                item.id === selectedPointId && styles.selected,
              ]}
            />
          </Marker>
        ),
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  // Clusters: paper discs with serif numerals.
  cluster: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderControl,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: elevation.soft,
  },
  // Public place: a plum dot in a paper ring.
  point: {
    width: 20,
    height: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.actionPrimary,
    borderWidth: 3,
    borderColor: colors.surface,
    boxShadow: elevation.soft,
  },
  // Private studio: a hollow iris ring, never a pin (the address is not shown, P-12).
  area: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.progress,
    backgroundColor: 'rgba(253, 251, 248, 0.6)',
  },
  selected: {
    transform: [{ scale: 1.3 }],
  },
});
