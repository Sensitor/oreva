import { spacing } from '@oreva/tokens';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Reveal } from './Reveal';
import { SectionHeader } from './SectionHeader';

export interface SectionProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  /** Enter with the screen, at this position (phase D). */
  revealIndex?: number;
}

export function Section({ title, actionLabel, onAction, children, revealIndex }: SectionProps) {
  const Wrapper = revealIndex === undefined ? View : Reveal;
  return (
    <Wrapper style={styles.section} index={revealIndex}>
      <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
});
