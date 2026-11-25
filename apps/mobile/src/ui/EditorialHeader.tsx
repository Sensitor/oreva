import { spacing } from '@oreva/tokens';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { Masthead } from './Masthead';
import { Reveal } from './Reveal';

export interface EditorialHeaderProps {
  /** Context in the masthead: a date, a city, a section. */
  kicker?: string;
  title: string;
  intro?: string;
  /** An element at the end of the title row (an icon button). */
  action?: ReactNode;
}

/** The top of a main screen: the masthead between two rules, then the serif title. */
export function EditorialHeader({ kicker, title, intro, action }: EditorialHeaderProps) {
  return (
    <Reveal style={styles.header}>
      <Masthead label={kicker} />
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
      {intro ? (
        <AppText variant="body" color="textSecondary">
          {intro}
        </AppText>
      ) : null}
    </Reveal>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flexShrink: 1,
  },
});
