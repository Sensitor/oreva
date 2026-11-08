import { colors, spacing } from '@oreva/tokens';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Space kept free at the bottom for the floating tab bar. */
export const TAB_BAR_CLEARANCE = 112;

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** Leave room for the floating tab bar. */
  withTabBar?: boolean;
}

export function Screen({ children, scroll = true, withTabBar = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + spacing.md,
    paddingBottom: (withTabBar ? TAB_BAR_CLEARANCE : spacing.xl) + insets.bottom,
  };
  if (!scroll) {
    return <View style={[styles.container, styles.content, padding]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, padding]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg - 4,
    gap: spacing.lg,
  },
});
