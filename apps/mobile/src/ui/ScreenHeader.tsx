import { spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

export interface ScreenHeaderProps {
  title?: string;
  /** Element shown at the end of the header (e.g. a Follow button). */
  trailing?: ReactNode;
  onBack?: () => void;
}

/** Back button + optional title, in the round-button style of the visual reference. */
export function ScreenHeader({ title, trailing, onBack }: ScreenHeaderProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <IconButton
        icon={ChevronLeft}
        accessibilityLabel={t('a11y.back')}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      />
      {title ? (
        <AppText
          variant="headline"
          numberOfLines={1}
          style={styles.title}
          accessibilityRole="header"
        >
          {title}
        </AppText>
      ) : (
        <View style={styles.title} />
      )}
      <View style={styles.trailing}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  trailing: {
    minWidth: 52,
    alignItems: 'flex-end',
  },
});
