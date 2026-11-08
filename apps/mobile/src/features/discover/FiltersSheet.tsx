import type { Level, SpecialtyCode } from '@oreva/core';
import { spacing } from '@oreva/tokens';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { DEFAULT_CLASS_FILTERS, type ClassFilters } from '@/data/types';
import { AppText, Chip, PillButton, Sheet, ToggleRow } from '@/ui';

const WHEN: ClassFilters['when'][] = ['any', 'today', 'week'];
const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];
const SPECIALTIES: SpecialtyCode[] = ['mat', 'reformer', 'outdoor', 'barre', 'stretch'];
const LANGUAGES = ['en', 'fr', 'ru'];

export interface FiltersSheetProps {
  visible: boolean;
  filters: ClassFilters;
  /** Number of classes the draft filters would show. */
  countFor: (filters: ClassFilters) => number;
  onApply: (filters: ClassFilters) => void;
  onClose: () => void;
}

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export function FiltersSheet({ visible, filters, countFor, onApply, onClose }: FiltersSheetProps) {
  const { t } = useTranslation();
  // The parent remounts this sheet each time it opens, so the draft starts from the applied filters.
  const [draft, setDraft] = useState(filters);

  const count = countFor(draft);

  return (
    <Sheet
      visible={visible}
      title={t('discover.filters')}
      onClose={onClose}
      footer={
        <View style={styles.footer}>
          <PillButton
            label={t('common.reset')}
            tone="light"
            onPress={() => setDraft(DEFAULT_CLASS_FILTERS)}
          />
          <PillButton
            label={t('discover.showResults', { count })}
            onPress={() => onApply(draft)}
            testID="apply-filters"
          />
        </View>
      }
    >
      <View style={styles.group}>
        <AppText variant="headline">{t('discover.when.title')}</AppText>
        <View style={styles.chips}>
          {WHEN.map((value) => (
            <Chip
              key={value}
              label={t(`discover.when.${value}`)}
              selected={draft.when === value}
              onPress={() => setDraft({ ...draft, when: value })}
            />
          ))}
        </View>
      </View>
      <View style={styles.group}>
        <AppText variant="headline">{t('discover.filterLevel')}</AppText>
        <View style={styles.chips}>
          {LEVELS.map((value) => (
            <Chip
              key={value}
              label={t(`level.${value}`)}
              selected={draft.levels.includes(value)}
              onPress={() => setDraft({ ...draft, levels: toggle(draft.levels, value) })}
            />
          ))}
        </View>
      </View>
      <View style={styles.group}>
        <AppText variant="headline">{t('discover.filterSpecialty')}</AppText>
        <View style={styles.chips}>
          {SPECIALTIES.map((value) => (
            <Chip
              key={value}
              label={t(`specialty.${value}`)}
              selected={draft.specialties.includes(value)}
              onPress={() => setDraft({ ...draft, specialties: toggle(draft.specialties, value) })}
              testID={`filter-specialty-${value}`}
            />
          ))}
        </View>
      </View>
      <View style={styles.group}>
        <AppText variant="headline">{t('discover.filterLanguage')}</AppText>
        <View style={styles.chips}>
          <Chip
            label={t('discover.anyLanguage')}
            selected={draft.language === null}
            onPress={() => setDraft({ ...draft, language: null })}
          />
          {LANGUAGES.map((value) => (
            <Chip
              key={value}
              label={t(`spokenLanguage.${value}`)}
              selected={draft.language === value}
              onPress={() => setDraft({ ...draft, language: value })}
            />
          ))}
        </View>
      </View>
      <View style={styles.toggles}>
        <ToggleRow
          label={t('discover.freeOnly')}
          value={draft.freeOnly}
          onValueChange={(freeOnly) => setDraft({ ...draft, freeOnly })}
          testID="filter-free"
        />
        <ToggleRow
          label={t('discover.availableOnly')}
          value={draft.availableOnly}
          onValueChange={(availableOnly) => setDraft({ ...draft, availableOnly })}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  toggles: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
