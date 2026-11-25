import { colors, radii, spacing, type ColorToken } from '@oreva/tokens';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { CutShape } from './CutShape';
import { PressableScale } from './PressableScale';
import { Reveal } from './Reveal';

/**
 * - plum: the one strong block of a screen (Today), paper text.
 * - paper: a printed card, paper with a plum rule around it.
 * - sand: a quiet block (the guest card).
 */
export type BlockTone = 'plum' | 'paper' | 'sand';

export interface EditorialCoverProps {
  tone?: BlockTone;
  kicker?: string;
  title: string;
  meta?: string;
  /** A large serif numeral above the title: the day, the chapter. */
  numeral?: string;
  /** Lay the cut-paper shapes in the top corner (strong moments only). */
  shapes?: boolean;
  /** Shown in the top corner, e.g. the sample data tag. */
  badge?: ReactNode;
  /** Shown under the text: facts, a button. */
  children?: ReactNode;
  onPress?: () => void;
  /** Spoken label when the whole block is a button. Defaults to title and meta. */
  accessibilityLabel?: string;
  minHeight?: number;
  /** Enter with the screen, at this position (phase D). */
  revealIndex?: number;
  testID?: string;
}

const TEXT: Record<BlockTone, { title: ColorToken; meta: ColorToken; kicker: ColorToken }> = {
  plum: { title: 'textOnAccentStrong', meta: 'textOnAccentStrong', kicker: 'textOnAccentStrong' },
  paper: { title: 'textBrand', meta: 'textOnPastelSecondary', kicker: 'textLink' },
  sand: { title: 'textBrand', meta: 'textOnPastelSecondary', kicker: 'textOnPastelSecondary' },
};

const SHAPE_COLORS: Record<BlockTone, [string, string, string]> = {
  plum: [colors.surfaceMuted, colors.accentSoft, colors.accent],
  paper: [colors.accentSoft, colors.actionPrimary, colors.accent],
  sand: [colors.surface, colors.accentSoft, colors.actionPrimary],
};

/**
 * A block of the printed programme (identity C-9): flat colour, almost square
 * corners, a serif title, and on strong moments the cut-paper shapes laid in
 * the corner. No gradient, no photograph pretending to be real.
 */
export function EditorialCover({
  tone = 'paper',
  kicker,
  title,
  meta,
  numeral,
  shapes = false,
  badge,
  children,
  onPress,
  accessibilityLabel,
  minHeight,
  revealIndex,
  testID,
}: EditorialCoverProps) {
  const text = TEXT[tone];
  const [sun, leaf, seed] = SHAPE_COLORS[tone];
  const content = (
    <View style={[styles.block, toneStyles[tone], minHeight ? { minHeight } : null]}>
      {shapes ? (
        <View style={styles.shapes} pointerEvents="none">
          <CutShape shape="sun" size={120} color={sun} style={styles.sun} delay={80} />
          <CutShape
            shape="leaf"
            size={128}
            color={leaf}
            rotate={-14}
            style={styles.leaf}
            delay={180}
          />
          <CutShape
            shape="seed"
            size={30}
            color={seed}
            rotate={22}
            style={styles.seed}
            delay={280}
          />
        </View>
      ) : null}
      <View style={styles.top}>
        {kicker ? (
          <AppText variant="kicker" color={text.kicker} style={styles.kicker}>
            {kicker}
          </AppText>
        ) : (
          <View />
        )}
        {badge}
      </View>
      <View style={[styles.text, shapes && styles.textBelowShapes]}>
        {numeral ? (
          <AppText
            variant="numeral"
            color={text.title}
            style={styles.numeral}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            {numeral}
          </AppText>
        ) : null}
        <AppText
          variant="title1"
          color={text.title}
          accessibilityRole={onPress ? undefined : 'header'}
        >
          {title}
        </AppText>
        {meta ? (
          <AppText variant="callout" color={text.meta}>
            {meta}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );

  const block = !onPress ? (
    <View testID={testID}>{content}</View>
  ) : (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? [title, meta].filter(Boolean).join(', ')}
      onPress={onPress}
      testID={testID}
    >
      {content}
    </PressableScale>
  );
  return revealIndex === undefined ? block : <Reveal index={revealIndex}>{block}</Reveal>;
}

const toneStyles = StyleSheet.create({
  plum: { backgroundColor: colors.accentStrong },
  paper: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.actionPrimary,
  },
  sand: { backgroundColor: colors.surfaceMuted },
});

const styles = StyleSheet.create({
  block: {
    borderRadius: radii.xs,
    padding: spacing.gutter,
    gap: spacing.md,
    overflow: 'hidden',
  },
  shapes: {
    position: 'absolute',
    top: 0,
    end: 0,
    width: 190,
    height: 170,
  },
  sun: {
    position: 'absolute',
    top: -30,
    end: -18,
  },
  leaf: {
    position: 'absolute',
    top: 40,
    end: 30,
  },
  seed: {
    position: 'absolute',
    top: 120,
    end: 36,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  kicker: {
    flexShrink: 1,
  },
  text: {
    gap: spacing.xxs,
  },
  // Text starts below the sun and keeps clear of the leaf and seed on the end side.
  textBelowShapes: {
    marginTop: spacing.xxxl + spacing.lg,
    paddingEnd: 96,
  },
  numeral: {
    fontSize: 88,
    lineHeight: 88,
    letterSpacing: -2,
  },
});
