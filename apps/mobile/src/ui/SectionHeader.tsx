import { spacing, touchTarget } from '@oreva/tokens';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="title2" color="textBrand" accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="link"
          onPress={onAction}
          hitSlop={12}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <AppText variant="callout" weight="semibold" color="textLink">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    flexShrink: 1,
  },
  action: {
    minHeight: touchTarget.min,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
