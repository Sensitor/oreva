import { spacing } from '@oreva/tokens';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { Line } from './Line';

export interface EditorialHeaderProps {
  /** Context above the title: a date, a city, a week. */
  kicker?: string;
  title: string;
  intro?: string;
  /** An element at the end of the title row (an icon button). */
  action?: ReactNode;
}

/** The top of a main screen: kicker, serif title, the signature line. */
export function EditorialHeader({ kicker, title, intro, action }: EditorialHeaderProps) {
  return (
    <View style={styles.header}>
      {kicker ? (
        <AppText variant="kicker" color="textLink">
          {kicker}
        </AppText>
      ) : null}
      <View style={styles.titleRow}>
        <AppText
          variant="display"
          color="textBrand"
          accessibilityRole="header"
          style={styles.title}
        >
          {title}
        </AppText>
        {action}
      </View>
      <Line />
      {intro ? (
        <AppText variant="body" color="textSecondary" style={styles.intro}>
          {intro}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flexShrink: 1,
  },
  intro: {
    marginTop: spacing.xxs,
  },
});
