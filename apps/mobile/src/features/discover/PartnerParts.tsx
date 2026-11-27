import { colors, spacing } from '@oreva/tokens';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/ui';

/** A section of a partner's page: a serif title, then its content. */
export function PartnerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="title2" color="textBrand" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

export const partnerStyles = StyleSheet.create({
  heading: {
    gap: spacing.xs,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 72,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
});

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
});
