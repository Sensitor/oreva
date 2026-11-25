import { resolveLocalizedText, type Program } from '@oreva/core';
import { colors, spacing } from '@oreva/tokens';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { AppText, PressableScale, SampleBadge } from '@/ui';

export interface ProgramChapterProps {
  /** Position in the list, shown as "01", "02"… like the chapters of a programme. */
  index: number;
  program: Program;
  onPress: () => void;
  testID?: string;
}

/** A program as a chapter of the printed programme: numeral, title, length and level. */
export function ProgramChapter({ index, program, onPress, testID }: ProgramChapterProps) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const title = resolveLocalizedText(program.title, locale)?.text ?? '';
  const weeks = t('home.programs.weeks', { count: program.weeks });
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${weeks}`}
      onPress={onPress}
      style={styles.row}
      testID={testID}
    >
      <AppText
        variant="numeral"
        color="textBrand"
        style={styles.numeral}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {String(index + 1).padStart(2, '0')}
      </AppText>
      <View style={styles.text}>
        <AppText variant="title2" color="textPrimary">
          {title}
        </AppText>
        <AppText variant="footnote" color="textSecondary">
          {weeks} · {t(`level.${program.level}`)}
        </AppText>
        {program.isPlaceholder ? <SampleBadge /> : null}
      </View>
      <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  numeral: {
    minWidth: 64,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
