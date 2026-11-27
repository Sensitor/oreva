import { LOCALE_INFO, SUPPORTED_LOCALES, type Locale } from '@oreva/i18n';
import { colors, radii } from '@oreva/tokens';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { haptics } from '@/theme/haptics';
import { AppText, Screen } from '@/ui';

/**
 * Language picker (editorial direction): the title in serif, then each
 * language in its own name on a fine rule, the chosen one marked with an
 * iris ring and a check. Never shown by colour alone: announced as checked.
 */
export function LanguageScreen() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocaleSettings();

  const choose = (next: Locale) => {
    if (next !== locale) {
      haptics.selection();
    }
    void setLocale(next);
  };

  return (
    <Screen withTabBar={false}>
      <AppText variant="display" color="textBrand" accessibilityRole="header">
        {t('profile.language')}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {t('profile.languageHint')}
      </AppText>
      <View style={styles.list} accessibilityRole="radiogroup">
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
              <AppText
                variant="title2"
                color={selected ? 'textBrand' : 'textPrimary'}
                style={styles.label}
              >
                {LOCALE_INFO[code].nativeName}
              </AppText>
              <View style={[styles.check, selected && styles.checkSelected]}>
                {selected ? (
                  <Check size={16} color={colors.textOnAction} strokeWidth={2.25} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  label: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
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
    backgroundColor: colors.progress,
    borderColor: colors.progress,
  },
});
