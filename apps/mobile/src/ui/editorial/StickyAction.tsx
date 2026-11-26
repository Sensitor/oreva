import { colors, spacing } from '@oreva/tokens';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Height the content keeps free under the sticky action (button and padding). */
export const STICKY_ACTION_CLEARANCE = 52 + spacing.md * 2;

/**
 * The one action of a detail page (Start), kept within reach at the bottom of
 * the screen on a cream bar with a hairline, above the home indicator.
 */
export function StickyAction({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.gutter,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});
