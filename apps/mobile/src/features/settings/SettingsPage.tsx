import { colors, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/ui';
import { Enter, RoundButton } from '@/ui/editorial';

/**
 * A settings page in the editorial direction: the round back button, the
 * title in large serif, an optional intro, then the content on fine rules.
 */
export function SettingsPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xs, paddingBottom: insets.bottom + spacing.xxl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.bar}>
        <RoundButton
          icon={ChevronLeft}
          accessibilityLabel={t('a11y.back')}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/profile'))}
          testID="settings-back"
        />
      </View>
      <Enter index={0} style={styles.heading}>
        <AppText variant="display" color="textBrand" accessibilityRole="header">
          {title}
        </AppText>
        {intro ? (
          <AppText variant="body" color="textSecondary">
            {intro}
          </AppText>
        ) : null}
      </Enter>
      <Enter index={1} style={styles.body}>
        {children}
      </Enter>
    </ScrollView>
  );
}

export const settingsStyles = StyleSheet.create({
  // The first row of a list gets a fine rule above it too.
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.lg,
  },
  bar: {
    flexDirection: 'row',
  },
  heading: {
    gap: spacing.xs,
  },
  body: {
    gap: spacing.md,
  },
});
