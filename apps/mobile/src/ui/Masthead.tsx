import { colors, spacing } from '@oreva/tokens';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';

export interface MastheadProps {
  /** The context on the end side: the date, the city, the section. */
  label?: string;
}

/**
 * The top of a page, as on a printed programme: a heavy rule, the ORÉVA
 * wordmark and the context, a fine rule.
 */
export function Masthead({ label }: MastheadProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.bar}>
      <AppText variant="kicker" weight="bold" color="textBrand" accessibilityElementsHidden>
        {t('app.name')}
      </AppText>
      {label ? (
        <AppText
          variant="kicker"
          color="textBrand"
          numberOfLines={1}
          style={styles.label}
          maxFontSizeMultiplier={1.4}
        >
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderTopWidth: 2,
    borderBottomWidth: 1,
    borderColor: colors.actionPrimary,
  },
  label: {
    flexShrink: 1,
  },
});
