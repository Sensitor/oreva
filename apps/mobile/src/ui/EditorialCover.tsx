import { radii, spacing, voiles, type VoileTint } from '@oreva/tokens';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { Voile, VoileLine } from './Voile';

export interface EditorialCoverProps {
  tint?: VoileTint;
  kicker?: string;
  title: string;
  meta?: string;
  /** Shown in the top corner, e.g. the sample data tag. */
  badge?: ReactNode;
  /** Shown under the text, e.g. a button. */
  children?: ReactNode;
  onPress?: () => void;
  /** Spoken label when the whole cover is a button. Defaults to title and meta. */
  accessibilityLabel?: string;
  minHeight?: number;
  /** Width to height, e.g. 3 / 2 for a studio cover. */
  aspectRatio?: number;
  testID?: string;
}

/**
 * A cover for a program, a workout or a studio: text set on a Voile, the way
 * a magazine sets a headline on a photograph. Text colors come from the
 * voile tokens, which are contrast-tested at every gradient stop.
 */
export function EditorialCover({
  tint = 'lilac',
  kicker,
  title,
  meta,
  badge,
  children,
  onPress,
  accessibilityLabel,
  minHeight = 220,
  aspectRatio,
  testID,
}: EditorialCoverProps) {
  const voile = voiles[tint];
  const content = (
    <Voile tint={tint} withLine={false} style={[styles.cover, { minHeight, aspectRatio }]}>
      <View style={styles.top}>
        {kicker ? (
          <AppText variant="kicker" color={voile.meta} style={styles.kicker}>
            {kicker}
          </AppText>
        ) : (
          <View />
        )}
        {badge}
      </View>
      {/* The line sits in the open space between kicker and title, never under text. */}
      <VoileLine tint={tint} style={styles.wave} />
      <View style={styles.text}>
        <AppText
          variant="title1"
          color={voile.text}
          accessibilityRole={onPress ? undefined : 'header'}
        >
          {title}
        </AppText>
        {meta ? (
          <AppText variant="callout" color={voile.meta}>
            {meta}
          </AppText>
        ) : null}
      </View>
      {children}
    </Voile>
  );

  if (!onPress) {
    return (
      <View style={styles.shell} testID={testID}>
        {content}
      </View>
    );
  }
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? [title, meta].filter(Boolean).join(', ')}
      onPress={onPress}
      style={styles.shell}
      testID={testID}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  cover: {
    padding: spacing.gutter,
    gap: spacing.md,
    justifyContent: 'space-between',
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
  wave: {
    flexGrow: 1,
    minHeight: 24,
    maxHeight: 72,
    marginHorizontal: -spacing.gutter,
  },
  text: {
    gap: spacing.xxs,
  },
});
