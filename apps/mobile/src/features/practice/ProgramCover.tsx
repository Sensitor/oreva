import { resolveLocalizedText, type Program } from '@oreva/core';
import { colors, elevation, radii, spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { AppText, SampleBadge } from '@/ui';
import { EditorialImage, photoFor, ProgressThread, SpringPressable } from '@/ui/editorial';
import type { ProgramProgress } from './programProgress';

/** How far the caption is laid over the photograph. */
const CAPTION_OVERLAP = 72;

/**
 * A program as a magazine chapter: a large 4:5 photograph and, laid over its
 * lower edge, a paper caption with the chapter number, the program and its
 * real progress on this phone.
 */
export function ProgramCover({
  program,
  index,
  progress,
  onPress,
  testID,
}: {
  program: Program;
  index: number;
  progress: ProgramProgress;
  onPress: () => void;
  testID?: string;
}) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const title = resolveLocalizedText(program.title, locale)?.text ?? '';
  const weeks = t('home.programs.weeks', { count: program.weeks });
  const level = t(`level.${program.level}`);
  const done = t('practice.sessionsDone', {
    done: progress.doneDays,
    count: progress.sessionDays.length,
  });
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityLabel={[title, weeks, level, done].join(', ')}
      onPress={onPress}
      pressedScale={0.985}
      testID={testID}
    >
      <EditorialImage photo={photoFor(program.id)} style={styles.photo} />
      <View style={styles.caption}>
        <View style={styles.captionTop}>
          <AppText variant="numeralSmall" color="textLink" style={styles.chapter}>
            {String(index + 1).padStart(2, '0')}
          </AppText>
          <View style={styles.flex}>
            <AppText variant="kicker" color="textLink" numberOfLines={1}>
              {weeks} · {level}
            </AppText>
            <AppText variant="title2" color="textPrimary">
              {title}
            </AppText>
          </View>
        </View>
        <View>
          <ProgressThread value={progress.value} label={t('practice.programProgress')} />
          <View style={styles.captionFoot}>
            <AppText variant="footnote" color="textSecondary" style={styles.flex}>
              {done}
            </AppText>
            {program.isPlaceholder ? <SampleBadge /> : null}
          </View>
        </View>
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: radii.cover,
  },
  caption: {
    marginTop: -CAPTION_OVERLAP,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    boxShadow: elevation.soft,
  },
  captionTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  chapter: {
    minWidth: 34,
  },
  captionFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  flex: {
    flex: 1,
  },
});
