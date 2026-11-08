import { SUPPORTED_LOCALES, LOCALE_INFO } from '@oreva/i18n';
import { spacing, typefaces, type TypefaceName } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText, Card, Chip, Screen } from '@/ui';

const TYPEFACES = Object.keys(typefaces) as TypefaceName[];

/**
 * Typeface comparison for the founders (decision P-14): the same headline and
 * paragraph in English, French and Russian, in Manrope or Onest. Development and
 * staging builds only. The choice applies to the whole app while previewing.
 */
export function DesignPreviewScreen() {
  const { t, i18n } = useTranslation();
  const { typeface, setTypeface } = useTheme();

  return (
    <Screen withTabBar={false}>
      <AppText variant="title1" accessibilityRole="header">
        {t('designPreview.title')}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {t('designPreview.intro')}
      </AppText>
      <View style={styles.switcher}>
        <AppText variant="callout" color="textSecondary">
          {t('designPreview.typeface')}
        </AppText>
        <View style={styles.chips}>
          {TYPEFACES.map((name) => (
            <Chip
              key={name}
              label={typefaces[name].label}
              selected={name === typeface}
              onPress={() => setTypeface(name)}
            />
          ))}
        </View>
      </View>
      {SUPPORTED_LOCALES.map((code) => {
        const tl = i18n.getFixedT(code);
        return (
          <Card key={code} style={styles.sample}>
            <AppText variant="caption" color="textSecondary">
              {LOCALE_INFO[code].nativeName}
            </AppText>
            <AppText variant="display" accessibilityLanguage={code}>
              {tl('designPreview.sampleHeadline')}
            </AppText>
            <AppText variant="title2" accessibilityLanguage={code}>
              {tl('home.headline')}
            </AppText>
            <AppText variant="body" accessibilityLanguage={code}>
              {tl('designPreview.sampleBody')}
            </AppText>
            <AppText variant="footnote" color="textSecondary" accessibilityLanguage={code}>
              {tl('home.upcoming.spotsLeft', { count: 3 })} ·{' '}
              {tl('home.programs.weeks', { count: 4 })}
            </AppText>
          </Card>
        );
      })}
      <AppText variant="footnote" color="textSecondary">
        {t('designPreview.note')}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switcher: {
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sample: {
    gap: spacing.xs,
  },
});
