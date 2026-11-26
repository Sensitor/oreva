import {
  distanceMeters,
  resolveLocalizedText,
  type City,
  type GeoPoint,
  type MapPoint,
} from '@oreva/core';
import { dayKey, formatDayHeading, formatDistance } from '@oreva/i18n';
import { colors, elevation, radii, spacing, touchTarget } from '@oreva/tokens';
import { router } from 'expo-router';
import { List, Map as MapIcon, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, SectionList, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useClock } from '@/data/DataProvider';
import { applyClassFilters, countActiveFilters } from '@/data/filters';
import { useCities, useClasses, useMapPoints } from '@/data/hooks';
import { DEFAULT_CLASS_FILTERS, type ClassFilters, type ClassListItem } from '@/data/types';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { AppText, Button, EmptyState, NearIcon, TAB_BAR_CLEARANCE } from '@/ui';
import { rise, RoundButton, SpringPressable } from '@/ui/editorial';
import {
  EXPLORE,
  EXPLORE_CAMERA,
  itemsInArea,
  pointsInArea,
  venuePoint,
  type DiscoverArea,
} from './area';
import { CityPickerSheet } from './CityPickerSheet';
import { ClassCard } from './ClassCard';
import { FiltersSheet } from './FiltersSheet';
import { LocationPromptSheet } from './LocationPromptSheet';
import { DiscoverMap, mapboxConfigured } from './map/DiscoverMap';
import type { MapCamera } from './map/types';
import { PointPreview } from './PointPreview';
import { useNearMe } from './useNearMe';

/** Discover opens on Monaco, the first live area (roadmap revision 4). */
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
  const [area, setArea] = useState<DiscoverArea>({ kind: 'city', cityId: DEFAULT_CITY });
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

  const clock = useClock();
  const now = useMemo(() => clock(), [clock]);
  const filtered = useMemo(
    () => applyClassFilters(allClasses.data ?? [], filters, now),
    [allClasses.data, filters, now],
  );

  const moveCamera = useCallback((center: GeoPoint, zoom: number) => {
    setCamera((previous) => ({ center, zoom, revision: previous.revision + 1 }));
  }, []);

  const activeFilterCount = countActiveFilters(filters);

  const city = area.kind === 'city' ? cities.data?.find((c) => c.id === area.cityId) : undefined;
  const cityName = city ? (resolveLocalizedText(city.name, locale)?.text ?? '') : '';
  // What the search field shows: the city, "Near me", or nothing (explore).
  const areaLabel =
    area.kind === 'city' ? cityName : area.kind === 'near' ? t('discover.nearMe') : null;
  // Above the count: where the classes are (the city, near me, everywhere).
  const areaKicker = areaLabel ?? t('discover.everywhere');

  // The list, the count and the map all use the same area (city, explore or near me).
  const areaItems = useMemo(() => itemsInArea(filtered, area), [filtered, area]);
  const visiblePoints = useMemo(
    () => pointsInArea(points.data ?? [], area, areaItems, activeFilterCount > 0),
    [points.data, area, areaItems, activeFilterCount],
  );

  const selectCity = (next: City) => {
    setArea({ kind: 'city', cityId: next.id });
    setSelected(null);
    nearMe.clear();
    moveCamera(next.center, 11.5);
    setCityPickerOpen(false);
  };

  /** Back to explore: no city, no location. Filters stay as they are. */
  const clearArea = () => {
    setArea(EXPLORE);
    setSelected(null);
    nearMe.clear();
    moveCamera(EXPLORE_CAMERA.center, EXPLORE_CAMERA.zoom);
  };

  const goNearMe = async (point: GeoPoint | null) => {
    if (point) {
      setArea({ kind: 'near', point });
      setSelected(null);
      moveCamera(point, 12);
    }
  };

  // The list reads like a programme: tickets under a heading for each day.
  const sections = useMemo(() => {
    const byDay = new Map<string, { title: string; data: ClassListItem[] }>();
    for (const item of areaItems) {
      const instant = new Date(item.session.startsAt);
      const key = dayKey(instant, item.city.timeZone);
      const section = byDay.get(key) ?? {
        title: formatDayHeading(instant, formatLocale, item.city.timeZone),
        data: [],
      };
      section.data.push(item);
      byDay.set(key, section);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, section]) => ({ key, ...section }));
  }, [areaItems, formatLocale]);

  const distanceFor = (item: ClassListItem) =>
    area.kind === 'near'
      ? formatDistance(distanceMeters(area.point, venuePoint(item)), formatLocale)
      : undefined;

  const controls = (
    <View
      style={[
        styles.controls,
        { paddingTop: insets.top + spacing.xs },
        // Over the list the controls sit on cream, so the timetable never shows through.
        mode === 'list' && styles.controlsOverList,
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Pressable
            accessibilityRole="search"
            accessibilityLabel={t('discover.searchPlaceholder')}
            accessibilityHint={areaLabel ?? t('discover.searchOrExplore')}
            onPress={() => setCityPickerOpen(true)}
            style={({ pressed }) => [styles.searchOpen, pressed && styles.pressed]}
            testID="open-city-picker"
          >
            <Search size={20} color={colors.textSecondary} strokeWidth={1.5} />
            {areaLabel ? (
              <AppText variant="bodyStrong" numberOfLines={1} style={styles.searchText}>
                {areaLabel}
              </AppText>
            ) : (
              <AppText
                variant="body"
                color="textSecondary"
                numberOfLines={1}
                style={styles.searchText}
                testID="search-placeholder"
              >
                {t('discover.searchOrExplore')}
              </AppText>
            )}
          </Pressable>
          {areaLabel ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                area.kind === 'near'
                  ? t('discover.clearNearMe')
                  : t('discover.clearCity', { city: cityName })
              }
              hitSlop={4}
              onPress={clearArea}
              style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
              testID="clear-area"
            >
              <View style={styles.clearDot}>
                <X size={14} color={colors.textPrimary} strokeWidth={2} />
              </View>
            </Pressable>
          ) : null}
        </View>
        <RoundButton
          icon={NearIcon}
          accessibilityLabel={t('discover.nearMe')}
          onPress={() => void nearMe.start().then(goNearMe)}
          testID="near-me"
        />
      </View>
      <View style={styles.actionRow}>
        <SpringPressable
          accessibilityRole="button"
          pressedScale={0.95}
          accessibilityLabel={
            activeFilterCount > 0
              ? `${t('discover.filters')}, ${String(activeFilterCount)}`
              : t('discover.filters')
          }
          accessibilityState={{ selected: activeFilterCount > 0 }}
          onPress={() => setFiltersOpen(true)}
          style={[styles.pill, activeFilterCount > 0 && styles.pillActive]}
          testID="open-filters"
        >
          <SlidersHorizontal size={18} color={colors.textPrimary} strokeWidth={1.5} />
          <AppText variant="callout" weight={activeFilterCount > 0 ? 'bold' : 'semibold'}>
            {activeFilterCount > 0
              ? `${t('discover.filters')} · ${String(activeFilterCount)}`
              : t('discover.filters')}
          </AppText>
        </SpringPressable>
        {!isWeb ? (
          <SpringPressable
            accessibilityRole="button"
            pressedScale={0.95}
            haptic="selection"
            accessibilityLabel={mode === 'map' ? t('discover.showList') : t('discover.showMap')}
            onPress={() => setMode(mode === 'map' ? 'list' : 'map')}
            style={styles.pill}
            testID="toggle-view"
          >
            {mode === 'map' ? (
              <List size={18} color={colors.textPrimary} strokeWidth={1.5} />
            ) : (
              <MapIcon size={18} color={colors.textPrimary} strokeWidth={1.5} />
            )}
            <AppText variant="callout" weight="semibold">
              {mode === 'map' ? t('discover.showList') : t('discover.showMap')}
            </AppText>
          </SpringPressable>
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
            {/* The card under the map changes with a short rise (at once with Reduce Motion). */}
            <Animated.View
              key={selected?.id ?? 'summary'}
              entering={reduceMotion ? undefined : rise(0)}
            >
              {selected ? (
                <PointPreview point={selected} items={filtered} onClose={() => setSelected(null)} />
              ) : (
                <View style={styles.summary}>
                  <View style={styles.summaryText}>
                    <AppText variant="kicker" color="textLink" numberOfLines={1}>
                      {areaKicker}
                    </AppText>
                    <AppText variant="title1" color="textBrand" accessibilityLiveRegion="polite">
                      {t('discover.classesFound', { count: areaItems.length })}
                    </AppText>
                  </View>
                  <Button
                    label={t('discover.showList')}
                    variant="secondary"
                    shape="pill"
                    onPress={() => setMode('list')}
                  />
                </View>
              )}
            </Animated.View>
          </View>
        </>
      ) : (
        <>
          {controls}
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.session.id}
            renderItem={({ item }) => (
              <ClassCard item={item} distance={distanceFor(item)} hideDate />
            )}
            renderSectionHeader={({ section }) => (
              <AppText
                variant="title2"
                color="textBrand"
                accessibilityRole="header"
                style={styles.day}
              >
                {section.title}
              </AppText>
            )}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: TAB_BAR_CLEARANCE + insets.bottom },
            ]}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <AppText variant="kicker" color="textLink" numberOfLines={1}>
                  {areaKicker}
                </AppText>
                <AppText
                  variant="display"
                  color="textBrand"
                  accessibilityRole="header"
                  accessibilityLiveRegion="polite"
                >
                  {t('discover.classesFound', { count: areaItems.length })}
                </AppText>
                {isWeb ? (
                  <AppText variant="callout" color="textSecondary">
                    {t('discover.mapUnavailable')}
                  </AppText>
                ) : null}
              </View>
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
  controlsOverList: {
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  // A paper pill over the map.
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTarget.comfortable + 4,
    paddingStart: spacing.md,
    paddingEnd: spacing.xxs,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    boxShadow: elevation.raised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  searchOpen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: touchTarget.comfortable,
  },
  searchText: {
    flex: 1,
  },
  clear: {
    width: touchTarget.min,
    height: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearDot: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
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
    boxShadow: elevation.raised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderControl,
  },
  // Active filters read like a selected chip: lilac with an iris edge.
  pillActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.progress,
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
  // Paper card under the map: where, how many, and the way to the list.
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
    paddingStart: spacing.gutter,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    boxShadow: elevation.raised,
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  list: {
    paddingTop: 150,
    paddingHorizontal: spacing.gutter,
  },
  listHeader: {
    gap: spacing.xxs,
    paddingBottom: spacing.xs,
  },
  // A day of the timetable: a serif heading on a fine rule.
  day: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderControl,
  },
});
