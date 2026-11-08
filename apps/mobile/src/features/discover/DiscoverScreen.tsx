import {
  distanceMeters,
  resolveLocalizedText,
  type City,
  type GeoPoint,
  type MapPoint,
} from '@oreva/core';
import { formatDistance } from '@oreva/i18n';
import { colors, elevation, radii, spacing, touchTarget } from '@oreva/tokens';
import { router } from 'expo-router';
import { List, LocateFixed, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { applyClassFilters, countActiveFilters } from '@/data/filters';
import { useCities, useClasses, useMapPoints } from '@/data/hooks';
import { DEFAULT_CLASS_FILTERS, type ClassFilters, type ClassListItem } from '@/data/types';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { AppText, EmptyState, IconButton, PillButton, TAB_BAR_CLEARANCE } from '@/ui';
import { CityPickerSheet } from './CityPickerSheet';
import { ClassCard } from './ClassCard';
import { FiltersSheet } from './FiltersSheet';
import { LocationPromptSheet } from './LocationPromptSheet';
import { DiscoverMap, mapboxConfigured } from './map/DiscoverMap';
import type { MapCamera } from './map/types';
import { PointPreview } from './PointPreview';
import { useNearMe } from './useNearMe';

type Area = { kind: 'city'; cityId: string } | { kind: 'near'; point: GeoPoint };

const NEAR_RADIUS_M = 30_000;
const DEFAULT_CITY = 'monaco';
const isWeb = Platform.OS === 'web';

/**
 * Discover (founders' decision 1): a worldwide map of fictional demo studios
 * and classes, with city search, Near me, filters and a list view.
 */
export function DiscoverScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { locale, formatLocale } = useLocaleSettings();
  const reduceMotion = useReduceMotion();
  const { state } = usePrototypeStore();

  const [mode, setMode] = useState<'map' | 'list'>(isWeb ? 'list' : 'map');
  const [filters, setFilters] = useState<ClassFilters>(DEFAULT_CLASS_FILTERS);
  const [area, setArea] = useState<Area>({ kind: 'city', cityId: DEFAULT_CITY });
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [camera, setCamera] = useState<MapCamera>({
    center: { latitude: 43.7384, longitude: 7.4246 },
    zoom: 11.5,
    revision: 0,
  });

  const nearMe = useNearMe();
  const cities = useCities();
  const points = useMapPoints(state.mapStressTest);
  const allClasses = useClasses(DEFAULT_CLASS_FILTERS);

  const now = useMemo(() => new Date(), []);
  const filtered = useMemo(
    () => applyClassFilters(allClasses.data ?? [], filters, now),
    [allClasses.data, filters, now],
  );

  const moveCamera = useCallback((center: GeoPoint, zoom: number) => {
    setCamera((previous) => ({ center, zoom, revision: previous.revision + 1 }));
  }, []);

  const city = area.kind === 'city' ? cities.data?.find((c) => c.id === area.cityId) : undefined;
  const cityName = city
    ? (resolveLocalizedText(city.name, locale)?.text ?? '')
    : t('discover.nearMe');

  // Venues shown on the map: all of them, or only those with a matching class when filters are on.
  const visiblePoints = useMemo(() => {
    const all = points.data ?? [];
    if (countActiveFilters(filters) === 0) {
      return all;
    }
    const venueIds = new Set(filtered.map((item) => item.venue.id));
    return all.filter((point) => venueIds.has(point.venueId));
  }, [points.data, filters, filtered]);

  // Classes in the current area, for the list and the summary.
  const areaItems = useMemo(() => {
    if (area.kind === 'city') {
      return filtered.filter((item) => item.city.id === area.cityId);
    }
    return filtered
      .map((item) => ({ item, meters: distanceMeters(area.point, venuePoint(item)) }))
      .filter(({ meters }) => meters <= NEAR_RADIUS_M)
      .sort((a, b) => a.meters - b.meters)
      .map(({ item }) => item);
  }, [filtered, area]);

  const selectCity = (next: City) => {
    setArea({ kind: 'city', cityId: next.id });
    setSelected(null);
    nearMe.clear();
    moveCamera(next.center, 11.5);
    setCityPickerOpen(false);
  };

  const goNearMe = async (point: GeoPoint | null) => {
    if (point) {
      setArea({ kind: 'near', point });
      setSelected(null);
      moveCamera(point, 12);
    }
  };

  const distanceFor = (item: ClassListItem) =>
    area.kind === 'near'
      ? formatDistance(distanceMeters(area.point, venuePoint(item)), formatLocale)
      : undefined;

  const activeFilterCount = countActiveFilters(filters);

  const controls = (
    <View
      style={[styles.controls, { paddingTop: insets.top + spacing.xs }]}
      pointerEvents="box-none"
    >
      <View style={styles.searchRow}>
        <Pressable
          accessibilityRole="search"
          accessibilityLabel={t('discover.searchPlaceholder')}
          accessibilityHint={cityName}
          onPress={() => setCityPickerOpen(true)}
          style={({ pressed }) => [styles.search, pressed && styles.pressed]}
          testID="open-city-picker"
        >
          <Search size={20} color={colors.textSecondary} strokeWidth={1.75} />
          <AppText variant="bodyStrong" numberOfLines={1} style={styles.searchText}>
            {cityName}
          </AppText>
        </Pressable>
        <IconButton
          icon={LocateFixed}
          accessibilityLabel={t('discover.nearMe')}
          onPress={() => void nearMe.start().then(goNearMe)}
          testID="near-me"
        />
      </View>
      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            activeFilterCount > 0
              ? `${t('discover.filters')}, ${String(activeFilterCount)}`
              : t('discover.filters')
          }
          onPress={() => setFiltersOpen(true)}
          style={({ pressed }) => [
            styles.pill,
            activeFilterCount > 0 && styles.pillActive,
            pressed && styles.pressed,
          ]}
          testID="open-filters"
        >
          <SlidersHorizontal size={18} color={colors.textPrimary} strokeWidth={2} />
          <AppText variant="callout" weight="semibold">
            {activeFilterCount > 0
              ? `${t('discover.filters')} · ${String(activeFilterCount)}`
              : t('discover.filters')}
          </AppText>
        </Pressable>
        {!isWeb ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mode === 'map' ? t('discover.showList') : t('discover.showMap')}
            onPress={() => setMode(mode === 'map' ? 'list' : 'map')}
            style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
            testID="toggle-view"
          >
            {mode === 'map' ? (
              <List size={18} color={colors.textPrimary} strokeWidth={2} />
            ) : (
              <MapIcon size={18} color={colors.textPrimary} strokeWidth={2} />
            )}
            <AppText variant="callout" weight="semibold">
              {mode === 'map' ? t('discover.showList') : t('discover.showMap')}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {state.mapProvider === 'mapbox' && !mapboxConfigured && !isWeb && mode === 'map' ? (
        <View style={styles.notice}>
          <AppText variant="footnote" color="info">
            {t('discover.mapboxMissing')}
          </AppText>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {mode === 'map' ? (
        <>
          <DiscoverMap
            points={visiblePoints}
            selectedPointId={selected?.id ?? null}
            onSelectPoint={setSelected}
            camera={camera}
            userArea={area.kind === 'near' ? area.point : null}
            reduceMotion={reduceMotion}
            labels={{
              map: t('discover.a11yMap'),
              point: (point) =>
                t('discover.a11yPoint', {
                  name:
                    allClasses.data?.find((i) => i.venue.id === point.venueId)?.organization.name ??
                    '',
                  classes: t('discover.upcomingClasses', { count: point.upcomingClasses }),
                }),
              cluster: (count) => t('discover.a11yCluster', { count }),
            }}
          />
          {controls}
          <View
            style={[
              styles.bottom,
              { paddingBottom: TAB_BAR_CLEARANCE + insets.bottom - spacing.lg },
            ]}
          >
            {selected ? (
              <PointPreview point={selected} items={filtered} onClose={() => setSelected(null)} />
            ) : (
              <View style={styles.summary}>
                <AppText variant="bodyStrong" accessibilityLiveRegion="polite">
                  {t('discover.classesFound', { count: areaItems.length })}
                </AppText>
                <PillButton
                  label={t('discover.showList')}
                  tone="light"
                  onPress={() => setMode('list')}
                />
              </View>
            )}
          </View>
        </>
      ) : (
        <>
          {controls}
          <FlatList
            data={areaItems}
            keyExtractor={(item) => item.session.id}
            renderItem={({ item }) => <ClassCard item={item} distance={distanceFor(item)} />}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: TAB_BAR_CLEARANCE + insets.bottom },
            ]}
            ListHeaderComponent={
              isWeb ? (
                <AppText variant="callout" color="textSecondary">
                  {t('discover.mapUnavailable')}
                </AppText>
              ) : (
                <AppText variant="bodyStrong" accessibilityLiveRegion="polite">
                  {t('discover.classesFound', { count: areaItems.length })}
                </AppText>
              )
            }
            ListEmptyComponent={
              <EmptyState
                title={t('discover.noResults')}
                actionLabel={
                  activeFilterCount > 0 ? t('discover.clearFilters') : t('discover.chooseCity')
                }
                onAction={() =>
                  activeFilterCount > 0
                    ? setFilters(DEFAULT_CLASS_FILTERS)
                    : setCityPickerOpen(true)
                }
              />
            }
          />
        </>
      )}

      <CityPickerSheet
        visible={cityPickerOpen}
        cities={cities.data ?? []}
        selectedCityId={area.kind === 'city' ? area.cityId : null}
        onSelect={selectCity}
        onClose={() => setCityPickerOpen(false)}
      />
      <FiltersSheet
        key={filtersOpen ? 'filters-open' : 'filters-closed'}
        visible={filtersOpen}
        filters={filters}
        countFor={(draft) => applyClassFilters(allClasses.data ?? [], draft, now).length}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
          setSelected(null);
        }}
        onClose={() => setFiltersOpen(false)}
      />
      <LocationPromptSheet
        status={nearMe.status}
        onAllow={() => void nearMe.confirm().then(goNearMe)}
        onChooseCity={() => {
          nearMe.dismiss();
          setCityPickerOpen(true);
        }}
        onOpenSettings={nearMe.openSettings}
        onClose={nearMe.dismiss}
      />
    </View>
  );
}

function venuePoint(item: ClassListItem): GeoPoint {
  return item.venue.visibility === 'public'
    ? item.venue.location
    : item.venue.approximateArea.center;
}

/** Opens a studio profile from anywhere in Discover. */
export function openOrganization(id: string) {
  router.push(`/organizations/${id}`);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  controls: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    zIndex: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: touchTarget.comfortable + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    boxShadow: elevation.raised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  searchText: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs + 2,
    minHeight: touchTarget.min,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    boxShadow: elevation.soft,
    borderWidth: 1,
    borderColor: colors.borderControl,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accentStrong,
  },
  pressed: {
    opacity: 0.85,
  },
  notice: {
    alignSelf: 'flex-start',
    backgroundColor: colors.infoSurface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
  },
  bottom: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.sm,
    paddingStart: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    boxShadow: elevation.raised,
  },
  list: {
    paddingTop: 180,
    paddingHorizontal: spacing.lg - 4,
    gap: spacing.sm,
  },
});
