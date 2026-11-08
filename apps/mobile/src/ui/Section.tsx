import { spacing } from '@oreva/tokens';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SectionHeader } from './SectionHeader';

export interface SectionProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

export function Section({ title, actionLabel, onAction, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
});
