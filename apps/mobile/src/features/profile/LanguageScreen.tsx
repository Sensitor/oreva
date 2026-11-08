import { LOCALE_INFO, SUPPORTED_LOCALES, type Locale } from '@oreva/i18n';
import { colors, radii, spacing } from '@oreva/tokens';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { AppText, Card, Screen } from '@/ui';

/** Language picker. Names are shown in their own language so anyone can find theirs. */
export function LanguageScreen() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocaleSettings();

  const choose = (next: Locale) => {
    void setLocale(next);
  };

  return (
    <Screen withTabBar={false}>
      <AppText variant="title1" accessibilityRole="header">
        {t('profile.language')}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {t('profile.languageHint')}
      </AppText>
      <Card padded={false} accessibilityRole="radiogroup">
        {SUPPORTED_LOCALES.map((code) => {
          const selected = code === locale;
          return (
            <Pressable
              key={code}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={LOCALE_INFO[code].nativeName}
              accessibilityLanguage={code}
              testID={`language-${code}`}
              onPress={() => choose(code)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <AppText variant="bodyStrong" style={styles.label}>
                {LOCALE_INFO[code].nativeName}
              </AppText>
              <View style={[styles.check, selected && styles.checkSelected]}>
                {selected ? (
                  <Check size={16} color={colors.textOnAccent} strokeWidth={2.5} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  label: {
    flex: 1,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.borderControl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accentStrong,
  },
});
