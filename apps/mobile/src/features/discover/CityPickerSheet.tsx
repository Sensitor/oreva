import { resolveLocalizedText, type City } from '@oreva/core';
import { colors, radii, spacing, touchTarget } from '@oreva/tokens';
import { Check, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText, SampleBadge, Sheet } from '@/ui';

export interface CityPickerSheetProps {
  visible: boolean;
  cities: City[];
  selectedCityId: string | null;
  onSelect: (city: City) => void;
  onClose: () => void;
}

const normalise = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * City search among ORÉVA's own cities (no third-party geocoding, decision
 * note 0002). Matches the name in every language, so "Лондон", "Londres" and
 * "London" all work.
 */
export function CityPickerSheet({
  visible,
  cities,
  selectedCityId,
  onSelect,
  onClose,
}: CityPickerSheetProps) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const { fontFamily } = useTheme();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = normalise(query.trim());
    return cities
      .filter(
        (city) => !q || Object.values(city.name).some((name) => normalise(name ?? '').includes(q)),
      )
      .sort((a, b) =>
        (resolveLocalizedText(a.name, locale)?.text ?? '').localeCompare(
          resolveLocalizedText(b.name, locale)?.text ?? '',
          locale,
        ),
      );
  }, [cities, query, locale]);

  return (
    <Sheet visible={visible} title={t('discover.cityPickerTitle')} onClose={onClose}>
      <View style={styles.search}>
        <Search size={20} color={colors.textSecondary} strokeWidth={1.75} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('discover.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel={t('discover.searchPlaceholder')}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          style={[styles.input, { fontFamily: fontFamily('regular') }]}
          testID="city-search-input"
        />
      </View>
      <AppText variant="footnote" color="textSecondary">
        {t('discover.cityPickerHint')}
      </AppText>
      <View style={styles.list}>
        {results.map((city) => {
          const selected = city.id === selectedCityId;
          return (
            <Pressable
              key={city.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={resolveLocalizedText(city.name, locale)?.text}
              onPress={() => onSelect(city)}
              testID={`city-${city.id}`}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.rowText}>
                <AppText variant="bodyStrong">
                  {resolveLocalizedText(city.name, locale)?.text}
                </AppText>
                <AppText variant="footnote" color="textSecondary">
                  {city.countryCode}
                </AppText>
              </View>
              {city.isPlaceholder ? <SampleBadge /> : null}
              {selected ? <Check size={20} color={colors.textPrimary} strokeWidth={2.5} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: touchTarget.comfortable,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderControl,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: touchTarget.comfortable,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 60,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  rowText: {
    flex: 1,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
