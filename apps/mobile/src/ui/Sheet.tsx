import { colors, spacing } from '@oreva/tokens';
import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

export interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/** Native page sheet (iOS) / full-screen modal (Android), with a close button. */
export function Sheet({ visible, title, onClose, children, footer }: SheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? 'none' : 'slide'}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.header}>
          <AppText variant="title2" accessibilityRole="header" style={styles.title}>
            {title}
          </AppText>
          <IconButton icon={X} accessibilityLabel={t('common.close')} onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
  },
});
