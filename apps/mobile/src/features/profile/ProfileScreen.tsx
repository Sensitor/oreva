import { LOCALE_INFO } from '@oreva/i18n';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight, Globe, Palette, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { appVariant, appVersion, isProduction } from '@/config/env';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { AppText, Card, Screen } from '@/ui';

interface RowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress: () => void;
  testID?: string;
}

function SettingsRow({ icon: Icon, label, value, onPress, testID }: RowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.rowIcon}>
        <Icon size={20} color={colors.textPrimary} strokeWidth={1.75} />
      </View>
      <AppText variant="bodyStrong" style={styles.rowLabel}>
        {label}
      </AppText>
      {value ? (
        <AppText variant="callout" color="textSecondary">
          {value}
        </AppText>
      ) : null}
      <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
    </Pressable>
  );
}

export function ProfileScreen() {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  return (
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        {t('profile.title')}
      </AppText>
      <Card padded={false}>
        <SettingsRow
          icon={Globe}
          label={t('profile.language')}
          value={LOCALE_INFO[locale].nativeName}
          onPress={() => router.push('/language')}
          testID="profile-language"
        />
        {!isProduction ? (
          <SettingsRow
            icon={Palette}
            label={t('profile.designPreview')}
            onPress={() => router.push('/design-preview')}
          />
        ) : null}
      </Card>
      <View style={styles.footer}>
        <AppText variant="footnote" color="textSecondary" align="center">
          {t('app.tagline')}
        </AppText>
        <AppText variant="caption" color="textSecondary" align="center">
          {t('profile.version', { version: appVersion })}
        </AppText>
        {!isProduction ? (
          <AppText variant="caption" color="textSecondary" align="center">
            {t('profile.environment', { name: appVariant })}
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.backgroundTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  footer: {
    gap: spacing.xxs,
    paddingTop: spacing.md,
  },
});
